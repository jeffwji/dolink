import React from 'react'
import MapView, {PROVIDER_GOOGLE, Marker, Callout, CalloutSubview, Polyline } from 'react-native-maps'
import StopMarker from './StopMarker'

import {
  Container,
  Item
} from 'native-base'

import {
  View,
  Dimensions,
  StyleSheet
} from 'react-native'

import MapSearchInput from './MapSearchInput';
import polyline from '@mapbox/polyline'

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
              <MapSearchInput 
                notifyLocationChange={(details) => {
                  this._resetStopCandidate(details)
                }}
                defaultLocations={[
                  { description: 'Home', geometry: { location: { lat: 43.8906719, lng: -79.2964162 } }, place_id: 'ChIJ1bQTc_zV1IkR_pQs6RrmKzo', isPredefinedPlace: true, name: 'Stonebridge Public School, Stonebridge Drive, Markham, ON, Canada'}
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
                  .then(point => {
                    return point.results.find(result => result.types.find(type => type === 'point_of_interest'))
                  })
                  .then(p => {
                    if(p) {
                      this._setStopCandidate(p)
                      this.update()
                    }
                  })
                  .catch(e => {
                    console.warn(e)
                  });
              }
            }}
            onLongPress={e => {
              if(!e.nativeEvent.action || e.nativeEvent.action === 'press') {
                googleMapService("geocode", `latlng=${this._coords2string(e.nativeEvent.coordinate)}`)
                  .then(detail => {
                    let result = detail.results.find(result => result.types.find(type => type === 'point_of_interest'))
                    result = result?result:detail.results.find(result => result.types.find(type => type === 'route'))
                    return result?result:detail.results[0]
                  })
                  .then(p => {
                    this._setStopCandidate(p)
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
              key= {marker.key}  // {index}
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
  }
});

