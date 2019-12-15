import React from 'react'
import MapView, {PROVIDER_GOOGLE, Marker, Callout, CalloutSubview, Polyline } from 'react-native-maps'
import CustomCallout from './CustomCallout'
import InterestedStopMarker from './InterestedStopMarker'
import PropTypes from 'prop-types';

import {
  Container,
  Icon,
  Item,
  Button,
  Drawer,
  Label,
  List
} from 'native-base'

import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native'

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import polyline from '@mapbox/polyline'

import axios from 'axios'
import GLOBAL, {askPermission, query, googleMapService, REACT_APP_GOOGLE_MAPS_API, REACT_APP_GOOGLE_PLACES_API} from './Global'

export default class GoogleMap extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      updateMap: 0
    }
  }

  currentLocationCoordinates = null
  directions = []
  stops = []
  stopMarkers = []
  stopCandidate = null

  componentDidMount () {
    if(this.currentLocationCoordinates==null ) {
      this._getCurrentPosition()
    }
  }

  _getCurrentPosition() {
    return askPermission('LOCATION').then(permit => {
      if(permit) {
        this._getLocation(
          data => {
            const region = {
              latitude: data.coords.latitude,
              longitude: data.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }
            this._updateCurrentLocation(region, true)
          },
          error => {
            console.log(error)
          }
        )
      }
      else throw 'No permission to obtain location'
    })
  }

  _getLocation(resolve, handleError) {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position), 
      error => handleError(error),
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 }
    )
  }

  _updateCurrentLocation(region, updateMap) {
    this.currentLocationCoordinates = region
    if(updateMap)
      this.update()
  }

  _resetStopCandidate(stopDetail) {
    this._setStopCandidate(stopDetail)

    this._updateCurrentLocation({
      latitude: stopDetail.geometry.location.lat,
      longitude: stopDetail.geometry.location.lng,
      latitudeDelta: this.currentLocationCoordinates.latitudeDelta,
      longitudeDelta: this.currentLocationCoordinates.longitudeDelta
    }, true)
  }

  _renderMap() {
    if(this.currentLocationCoordinates!=null) {
      return(
        <View style={styles.overallViewContainer}>
          <View style={styles.allNonMapThings}>
            <Item>
              <MapInput 
                notifyLocationChange={(details) => {
                  this._resetStopCandidate(details)
                }}
                defaultLocations={[
                  { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }, name: 'Market Saint Maurice'}
                ]}
              />
            </Item>
          </View>

          <MapView style={styles.mapView}
            provider={ PROVIDER_GOOGLE }
            region={this.currentLocationCoordinates}
            onRegionChange={region => this._updateCurrentLocation(region, false)}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true}
            followUserLocation={true}
            onPress={e => {
              if(!e.nativeEvent.action || e.nativeEvent.action === 'press') {
                googleMapService("geocode", `latlng=${this._coords2string(e.nativeEvent.coordinate)}`)
                  .then(detail => {
                    let result = detail.results.find(result => result.types.find(type => type === 'point_of_interest'))
                    result = result?result:detail.results.find(result => result.types.find(type => type === 'route'))
                    return result?result:detail.results[0]
                  })
                  .then(stopDetail => {
                    this._setStopCandidate(stopDetail)
                    this.update()
                  })
                  .catch(e => {
                    console.warn(e)
                  });
              }
            }}
          >
            {this._renderRoute()}
            {this._renderMarkers()}
            {this._renderCurrentMarker()}
          </MapView>
        </View>
      )
    }
  }

  _renderCurrentMarker() {
    if(this.stopCandidate != null)
        return(
          <StopMarker
            stopDetail={this.stopCandidate}
            color='#009688'
            addRemoveOpt = {stopDetail => this._addInterestedLocation(stopDetail)}
            orders = {[]}
            onStopLocationChange = {(stopDetail, orders) => this._onStopChange(stopDetail, orders)}
          />
        )
  }

  _renderMarkers() {
    return(
      this.stopMarkers.map(marker => marker)
    )
  }

  _getDirections() {
    this.directions= []
    if(this.stops.length > 1){
      const temp_stops = this.stops.map(s => s)
      let origin = temp_stops.shift()
      do{
        const dest = temp_stops.shift()
        this._getDirection(
          `${origin.geometry.location.lat},${origin.geometry.location.lng}`,
          `${dest.geometry.location.lat},${dest.geometry.location.lng}`
        )
        origin = dest
      }while(temp_stops.length > 0)
    }
  }

  _coords2string(coordinate){
    return coordinate.latitude + "," + coordinate.longitude
  }

  async _getDirection(origin, destination) {
    const mode = 'driving'; // 'walking';
    googleMapService("directions", `origin=${origin}&destination=${destination}&mode=${mode}`)
      .then(resp => {
        if (resp.routes.length) {
          const points = polyline.decode(resp.routes[0].overview_polyline.points)
          const coords = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
          })

          this.directions.push(coords)
          this.update()
        }
      })
      .catch(e => {
        console.warn(e)
      })
  }

  _renderRoute() {
    if(this.directions.length) {
      return this.directions.map((route, index) => 
        <Polyline
          key={index}
          coordinates={route}
          strokeWidth={4}
          strokeColor="hotpink"
        />)
    }
  }

  _updateMarker() {
    this.stopMarkers = []
    
    this.stops.map((stopDetail, index) => {
      const i = this.stopMarkers.findIndex(marker => {
        const s = marker.props.stopDetail.geometry.location
        return (s.lat == stopDetail.geometry.location.lat) && (s.lng == stopDetail.geometry.location.lng)
      })

      if (i < 0){
        const stopMarker =
          <StopMarker
            key={index}
            orders = {[index]}
            stopDetail={stopDetail}
            color='#f44336'
            addRemoveOpt = {order => this._removeInterestedLocation(order)}
            onStopLocationChange = {(stopDetail, orders) => this._onStopChange(stopDetail, orders)}
          />
        this.stopMarkers.push(stopMarker)
      }
      else {
        const marker = this.stopMarkers.splice(i, 1)[0]
        if(marker.props.orders.findIndex(order => {
          return order == index
        }) > -1) {
          this.stopMarkers.push(marker)
        }
        else {
          const orders = marker.props.orders.concat(index)
          const stopMarker = 
            <StopMarker
              key= {marker.props.key} //{index}
              orders = {orders}
              stopDetail={stopDetail}
              color='#f44336'
              addRemoveOpt = {order => this._removeInterestedLocation(order)}
              onStopLocationChange = {(stopDetail, orders) => this._onStopChange(stopDetail, orders)}
            />
          this.stopMarkers.push(stopMarker)
        }
      }
    } )

    this.stopCandidate=null

    this.update()
  }

  update() {
    this.setState({
      updateMap: this.state.updateMap + 1
    })
  }

  _onStopChange(stopDetail, orders) {
    if(orders.length > 0) {
      orders.map(order => {
        this.stops[order] = stopDetail
      })
      this._updateMarker()
      this._getDirections()
    }
    else{
      this._setStopCandidate(stopDetail)
    }
    this.update()
  }

  _setStopCandidate = (stopDetail) => {
    this.stopCandidate = stopDetail
  }

  _addInterestedLocation = (stopDetail) => {
    this.stops.push(stopDetail)
    this._updateMarker()
    this._getDirections()
  }

  _removeInterestedLocation = (order) => {
    this.stops.splice(order, 1)
    this._updateMarker()
    this._getDirections()
  }

  render() {
    return (
      <Container style={styles.container}>
        {this._renderMap()}
      </Container>
    )
  }
}

class StopMarker extends React.Component {
  constructor(props) {
    super(props)
  }
  marker = null

  render() {
    const stop = this.props.stopDetail
    const coord = {latitude: stop.geometry.location.lat, longitude: stop.geometry.location.lng }
    return(
      <Marker
        coordinate={coord}
        ref = {marker => this.marker = marker}
        title = {stop.description || stop.formatted_address || stop.name}
        onDragEnd={e => {
          const param = e.nativeEvent.coordinate.latitude + "," + e.nativeEvent.coordinate.longitude
          googleMapService("geocode", `latlng=${param}`)
            .then(detail => {
              let result = detail.results.find(result => result.types.find(type => type === 'point_of_interest'))
              result = result?result:detail.results.find(result => result.types.find(type => type === 'route'))
              return result?result:detail.results[0]
            })
            .then( newStopDetail => {
              this.props.onStopLocationChange(newStopDetail, this.props.orders)
            })
            .catch(e => {
              console.warn(e)
            });
        }}
        draggable
      >
        <InterestedStopMarker orders={this.props.orders} stopDetail={stop} />

        <StopCallout
          orders = {this.props.orders}
          stopDetail = {stop}
          addRemoveOpt={(stop) => {
            this.props.addRemoveOpt(stop)
          }} 
        />
      </Marker>
    
    )
  }
}

StopMarker.propTypes = {
  orders: PropTypes.array.isRequired,
  style: PropTypes.object,
}

class StopCallout extends React.Component {
  constructor(props) {
    super(props)
  }
  callout = null
  
  render() {
    if (this.props.orders.length === 0) {
      return(
        <Callout alphaHitTest tooltip
          ref = {callout => this.callout = callout}
          style={{width:220, height:100}}
          onPress={e => {
            if ( e.nativeEvent.action === 'marker-inside-overlay-press' || e.nativeEvent.action === 'callout-inside-press' ) {
              return;
            }
          }}
        >
          <CustomCallout>
            <Text>Add it to route</Text>
            <CalloutSubview
              onPress={() => {
                this.props.addRemoveOpt(this.props.stopDetail)
              }}>
              <Button>
                <Label>Add</Label>
              </Button>
            </CalloutSubview>
          </CustomCallout>
        </Callout>
      )
    }
    else {
      return(
        <Callout alphaHitTest tooltip
          ref = {callout => this.callout = callout}
          onPress={e => {
            if ( e.nativeEvent.action === 'marker-inside-overlay-press' || e.nativeEvent.action === 'callout-inside-press' ) {
              return;
            }
          }}
        >
          <CustomCallout
            style={styles.customCallout}>
            <ScrollView>
              {this.props.orders.map( (order, index) => this._renderStops(order, index) )}
            </ScrollView>
          </CustomCallout>
        </Callout>
      )
    }
  }

  _renderStops(order, index) {
    return(
        <View key={index}>
          <Text>Remove #{order} it to route</Text>
          <CalloutSubview onPress={() => {
                this.props.addRemoveOpt(order)
              }}>
            <Button>
              <Label>Remove #{order}</Label>
            </Button>
          </CalloutSubview>
        </View>
    )
  }
}

StopCallout.propTypes = {
  orders: PropTypes.array.isRequired,
  style: PropTypes.object,
}

class MapInput extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    return(
      <GooglePlacesAutocomplete
        placeholder='Enter Location'
        // minLength={2}
        autoFocus={true}
        returnKeyType={'search'}
        listViewDisplayed='false'
        fetchDetails={true}
        renderDescription={row => row.description || row.formatted_address || row.name}
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          this.props.notifyLocationChange(details) //details.geometry.location)
        }}
        query={{
          key: REACT_APP_GOOGLE_PLACES_API,
          language: 'en',
          types: 'geocode'
        }}
        styles={{
          textInputContainer: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderTopWidth: 0,
            borderBottomWidth:0,
            width: '100%'
          },
          textInput: {
            height: 38,
            color: '#5d5d5d',
            fontSize: 16
          },
          description: {
            fontWeight: 'bold'
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          }
        }}
        currentLocation={true}
        currentLocationLabel="Surround"
        predefinedPlaces={this.props.defaultLocations}
        nearbyPlacesAPI="GooglePlacesSearch"   // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={{
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
          //key: '',
          //language: 'en',
        }}
        GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          rankby: 'distance'
        }}
        GooglePlacesDetailsQuery={{
          // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
          // fields: 'formatted_address',
        }}
        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
        getDefaultValue={() => ''}
        enablePoweredByContainer={false}
        debounce={200}
      />
    )
  }
}


const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  overallViewContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  allNonMapThings: {
    alignItems: 'center',
    width: '100%'
  },
  mapView: {
    flex: 1
  },
  customCallout: {
    width: 250,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 12,
    alignItems: 'flex-end',
    marginHorizontal: 0,
    marginVertical: 0,
  },
  stopRow: {
    width: '100%',
    flexDirection: 'column',
  },
  stopList: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white'
  }
});

