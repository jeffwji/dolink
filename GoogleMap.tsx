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
import GLOBAL, {askPermission, query, REACT_APP_GOOGLE_MAPS_API, REACT_APP_GOOGLE_PLACES_API} from './Global'

export default class GoogleMap extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      currentLocationCoordinates: null,
      locationCoordinates: null,
      locationInput: '',
      currentMarker: null,
      updateMap: 0
    }
  }

  directions = []
  stops = []
  stopMarkers = []

  componentDidMount () {
    if(this.state.currentLocationCoordinates==null ) {
      this._getCurrentPosition(true)
    }
  }

  _getCurrentPosition(updateStateLocation=false) {
    return askPermission('LOCATION').then(permit => {
      if(permit) {
        this._getLocation(
          data => {
            this._updateCurrentLocation(data.coords.latitude, data.coords.longitude)
            if(updateStateLocation)
              this._updateStateLocation(data.coords.latitude, data.coords.longitude)
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

  // Update location by navigation
  _updateStateLocation(latitude, longitude) {
    this.setState({
      locationCoordinates: {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    })
  }

  _updateCurrentLocation(latitude, longitude) {
    this.setState({
      currentLocationCoordinates: {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    })
  }

  _renderMap() {
    if(this.state.locationCoordinates!=null) {
      return(
        <View style={styles.overallViewContainer}>
          <View style={styles.allNonMapThings}>
            <Item>
              <MapInput 
                notifyLocationChange={(details) => {
                  this._setCurrentMarker(details)
                }}
                defaultLocations={[
                  { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }, name: 'Market Saint Maurice'}
                ]}
              />
            </Item>
          </View>

          <MapView style={styles.mapView}
            provider={ PROVIDER_GOOGLE }
            initialRegion={this.state.currentLocationCoordinates}
            region={this.state.locationCoordinates}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true}
            followUserLocation={true}
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
    if(this.state.currentMarker != null)
      return(
        <StopMarker
          stop={this.state.currentMarker}
          color='#009688'
          addRemoveOpt = {stop => this._addInterestedLocation(stop)}
          orders = {[]}
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
        this._getDirection(this._coords2string(origin.latlng), this._coords2string(dest.latlng))   // (origin.name, dest.name)
        origin = dest
      }while(temp_stops.length > 0)
    }
  }

  _coords2string(coordinate){
    return coordinate.latitude + "," + coordinate.longitude
  }

  async _getDirection(origin, destination) {
    const mode = 'driving'; // 'walking';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${REACT_APP_GOOGLE_PLACES_API}&mode=${mode}`;

    fetch(url).then(response => 
          response.json()
        ).then(responseJson => {
            if (responseJson.routes.length) {
              const points = /*this._*/ polyline.decode(responseJson.routes[0].overview_polyline.points)
              const coords = points.map((point, index) => {
                return  {
                    latitude : point[0],
                    longitude : point[1]
                }
              })

              this.directions.push(coords)
              this.setState({updateMap: this.state.updateMap + 1})
            }
        }).catch(e => {
          console.warn(e)
        });
  }

  _renderRoute() {
    if(this.directions.length) {
      return this.directions.map((route, index) => 
        <Polyline
          key={index}
          coordinates={route}
          strokeWidth={4}
          strokeColor="blue"
        />)
    }
  }

  _updateMarker() {
    this.stopMarkers = []
    
    this.stops.map((stop, index) => {
      const i = this.stopMarkers.findIndex(marker => {
        const s = marker.props.stop.latlng
        return (s.latitude == stop.latlng.latitude) && (s.longitude == stop.latlng.longitude)
      })

      if (i < 0){
        const stopMarker =
          <StopMarker
            key={index}
            orders = {[index]}
            stop={stop}
            color='#f44336'
            addRemoveOpt = {order => this._removeInterestedLocation(order)}
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
              key={index}
              orders = {orders}
              stop={stop}
              color='#f44336'
              addRemoveOpt = {order => this._removeInterestedLocation(order)}
            />
          this.stopMarkers.push(stopMarker)
        }
      }
    } )

    this.setState({
      currentMarker: null,
      updateMap: this.state.updateMap + 1
    })
  }

  _setCurrentMarker = (details) => {
    const loc = details.geometry.location
    this._updateStateLocation(loc.lat, loc.lng)
    const stop = {
      latlng: {
        latitude: loc.lat,
        longitude: loc.lng
      },
      name: details.name,
      interested: false
    }
    this.setState({currentMarker: stop})
  }

  _addInterestedLocation = (s) => {
    const location = s.latlng
    this._updateStateLocation(location.latitude, location.longitude)
    const stop = {
      latlng: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      name: s.name,
      interested: true
    }

    this.stops.push(stop)
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
    this.marker = <Marker
        coordinate={this.props.stop.latlng}
        // pinColor={this.props.color}
      >
        <InterestedStopMarker orders={this.props.orders} />

        <StopCallout
          orders = {this.props.orders}
          stop = {this.props.stop}
          addRemoveOpt={(stop) => {
            this.props.addRemoveOpt(stop)
          }} 
        />
      </Marker>
    return(
      this.marker
    )
  }
}

/*
const stopMarkerPropTypes = {
  orders: PropTypes.array.isRequired
}
StopMarker.prototype = stopMarkerPropTypes
*/

class StopCallout extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    if (!this.props.stop.interested) {
      return(
        <Callout alphaHitTest tooltip
          style={{width:220, height:100}}
          onPress={e => {
            if ( e.nativeEvent.action === 'marker-inside-overlay-press' || e.nativeEvent.action === 'callout-inside-press' ) {
              return;
            }
          }}
        >
          <CustomCallout>
            <Text>Add it to route</Text>
            <CalloutSubview onPress={() => {
                this.props.addRemoveOpt(this.props.stop)
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
                this.props.addRemoveOpt(order) //.latlng)
              }}>
            <Button>
              <Label>Remove #{order}</Label>
            </Button>
          </CalloutSubview>
        </View>
    )
  }
}

/*
const stopCalloutPropTypes = {
  orders: PropTypes.array.isRequired
}
StopCallout.prototype = stopCalloutPropTypes
*/

class MapInput extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    // const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};

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
        currentLocationLabel="Current location"
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

