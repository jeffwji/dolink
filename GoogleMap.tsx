import React from 'react'
import MapView, {PROVIDER_GOOGLE, Polyline } from 'react-native-maps'
import StopMarker from './StopMarker'
import MarkerEditView from './MarkerEditView'

import {
  Container,
  Item
} from 'native-base'

import {
  View,
  Dimensions,
  StyleSheet,
  Alert
} from 'react-native'

import MapSearchInput from './MapSearchInput';
import polyline from '@mapbox/polyline'
import MapController from './MapController'

import {askPermission, googleMapService} from './Global'

type State = {
  showEditor: string;
};

export default class GoogleMap extends React.Component<State> {
  constructor(props) {
    super(props)
    
    this.state = {
      updateMap: 0,
      showEditor: null,
    }
  }

  defaultRouteColor = 'rgba(255, 20, 147, 0.5)'  // 'hotpink'
  selectedRouteColor = 'blue'
  invalidRouteColor = 'rgba(105,105,105,0.5)' //'gray'
  privacyRouteColor = 'rgba(128,0,12, 0.5)'  //'purple'
  showMarkerDetail = 1

  editingPlaceId = null
  currentLocationCoordinates = null
  directions = []
  routes = []
  selectedRoute = null
  stops = []
  stopMarkers = []
  stopCandidate = null

  componentDidMount () {
    if(this.currentLocationCoordinates==null ) {
      this._getCurrentPosition()
    }
  }

  _setCurrentEditPlaceId(place_id) {
    this.editingPlaceId = place_id
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

  _renderMap() {
    if(this.currentLocationCoordinates!=null) {
      return(
        <View style={styles.overallViewContainer}>
          <View style={styles.earchInput}>
            <Item>
              <MapSearchInput 
                notifyLocationChange={(details) => {
                  this._setStopCandidate(details)
                    .then(() =>
                      this._updateCurrentLocation({
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                        latitudeDelta: this.currentLocationCoordinates.latitudeDelta,
                        longitudeDelta: this.currentLocationCoordinates.longitudeDelta
                      }, true)
                    )
                    .catch(error => console.log(error))
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
            // initialRegion={this.currentLocationCoordinates}
            // onRegionChange={region => this._updateCurrentLocation(region, false)}
            onRegionChangeComplete={region => this._updateCurrentLocation(region, false)}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true}
            followUserLocation={true}
            onPoiClick = { e => {
              const poi = e.nativeEvent
              poi.geometry = {
                location: {
                  lat: poi.coordinate.latitude,
                  lng: poi.coordinate.longitude
                },
              }
              poi.place_id = poi.placeId
              this._setStopCandidate(poi)
                .then(() => {
                  this._updateCurrentLocation({
                        latitude: poi.coordinate.latitude,
                        longitude: poi.coordinate.longitude,
                        latitudeDelta: this.currentLocationCoordinates.latitudeDelta,
                        longitudeDelta: this.currentLocationCoordinates.longitudeDelta
                      }, true)
                  this.editingPlaceId = poi.placeId
                  this.setState({
                    showEditor: "Marker"
                })})
                .catch(error => console.log(error))
            }}
            onPress={ e=> {
              if(!e.nativeEvent.action || e.nativeEvent.action === 'press') {
                //this.stopCandidate = null
                this._closeStopEditModal()
              }
            } }
            /*onLongPress={ e => {
              if(!e.nativeEvent.action || e.nativeEvent.action === 'press') {
                googleMapService("geocode", `latlng=${this._coords2string(e.nativeEvent.coordinate)}`)
                  .then(detail => {
                    let result = detail.results.find(result => result.types.find(type => type === 'point_of_interest'))
                    result = result?result:detail.results.find(result => result.types.find(type => type === 'route'))
                    return result?result:detail.results[0]
                  })
                  .then(p => {
                    this._setStopCandidate(p)
                      .then(() => this.update())
                      .catch(error => console.log(error))
                  })
                  .catch(e => {
                    console.warn(e)
                  });
              }
            }}*/
          >
            {this._renderRoutes()}
            {this._renderMarkers()}
            {this._renderCurrentMarker()}
          </MapView>

          <MapController mapView={this} />
        </View>
      )
    }
  }

  _renderCurrentMarker() {
    if(this.stopCandidate != null)
      return(
        this._newMarker(this.stopCandidate)
      )
  }

  _newMarker(detail, key=0, color='#009688', orders=[]){
    return <StopMarker
      key = {key}
      stopDetail={detail}
      color={color}
      orders = {orders}
      editStop = {(marker) => this._editStop(marker)}
      onStopLocationChange = {(stopDetail, orders) => this._onStopChange(stopDetail, orders)}
      showDetail = {() => {return this.showMarkerDetail}}
    />
  }

  _renderMarkers() {
    return(
      this.stopMarkers.map(marker => marker)
    )
  }

  async _getDirections() {
    this.directions= []
    //this.selectedRoute = null

    if(this.stops.length > 1){
      const temp_stops = this.stops.map((stop, index) => {
        return {
          stop:stop,
          index:index
        }
      })
      let origin = temp_stops.shift()
      do{
        const dest = temp_stops.shift()
        const value = await this._getDirection(origin, dest)
        origin = dest
      }while(temp_stops.length > 0)
      this.update()
    }
  }

  _coords2string(coordinate){
    if(coordinate.latitude)
      return coordinate.latitude + "," + coordinate.longitude
    else
      return coordinate.lat + "," + coordinate.lng
  }

  async _getDirection(origin, dest) {
    if(origin.stop.stopDetail.place_id != dest.stop.stopDetail.place_id){
      const mode = dest.stop.transit_mode?dest.stop.transit_mode:'driving'
      return googleMapService("directions", `origin=${this._coords2string(origin.stop.stopDetail.geometry.location)}&destination=${this._coords2string(dest.stop.stopDetail.geometry.location)}&mode=${mode}`)
        .then(resp => {
          if (resp.routes.length) {
            this.directions.push({route:resp.routes[0], destination: dest.index, origin: origin.index, routeable: true})
            //this.update()
          } else {
            this.directions.push({
              route:[{
                latitude:origin.stop.stopDetail.geometry.location.lat,
                longitude:origin.stop.stopDetail.geometry.location.lng
              },{
                latitude:dest.stop.stopDetail.geometry.location.lat,
                longitude:dest.stop.stopDetail.geometry.location.lng
              }],
              //way_points: resp.geocoded_waypoints,
              destination: dest.index,
              origin: origin.index,
              routeable: false
            })
            //this.update()
          }
        })
        .catch(e => {
          console.warn(e)
        })
    }
  }

  _setTransitMode(stopIndex, mode) {
    this.stops[stopIndex].transit_mode=mode
  }

  _getTransitMode(stopIndex) {
    return this.stops[stopIndex].transit_mode?this.stops[stopIndex].transit_mode:'driving'
  }

  _route2coords(route){
    const points = polyline.decode(route.overview_polyline.points)
    return points.map((point, index) => {
      return  {
          latitude : point[0],
          longitude : point[1]
      }
    })
  }

  _getRouteColor(index) {
    if (index === this.selectedRoute)
      return this.selectedRouteColor
    else
      return this.defaultRouteColor
  }

  _getRoutes() {
    this.routes = this.directions.map((direction, index) => {
      if(direction.routeable) {
        return {
          polyline: <Polyline
            key={index}
            direction={direction}
            coordinates={this._route2coords(direction.route)}
            strokeWidth={4}
            strokeColor={this._getRouteColor(index)}
            tappable={true}
            onPress={e => {
              this.selectedRoute = index
              this.setState({showEditor: "Route"})
            }}
          />
        }
      } else {
        return {
          polyline: <Polyline
            key={index}
            direction={direction}
            coordinates={direction.route}
            strokeWidth={4}
            strokeColor={this.invalidRouteColor}
            tappable={true}
            onPress={e => {
              this.selectedRoute = index
              this.setState({showEditor: "Route"})
            }}
          />
        }
      }
    })
  }

  _renderRoutes() {
    if(this.directions.length) {
      this._getRoutes()
      return this.routes.map(r => r.polyline)
    }
  }

  _updateMarker() {
    this.stopMarkers = []
    // this.selectedRoute = null
    
    this.stops.map(({stopDetail, duration}, index) => {
      const i = this.stopMarkers.findIndex(marker => {
        const s = marker.props.stopDetail
        return (s.place_id == stopDetail.place_id)
      })

      if (i < 0){
        const stopMarker = this._newMarker(stopDetail, index, '#f44336', [{order:index, duration: () => this.stops[index].duration }]) //duration}])
        this.stopMarkers.push(stopMarker)
      }
      else {
        const marker = this.stopMarkers.splice(i, 1)[0]
        if(marker.props.orders.findIndex((order, duration) => {
          return order == index
        }) > -1) {
          this.stopMarkers.push(marker)
        }
        else {
          const orders = marker.props.orders.concat({order:index,  duration: () => this.stops[index].duration })
          const stopMarker = this._newMarker(stopDetail, marker.key, '#f44336', orders)
          this.stopMarkers.push(stopMarker)
        }
      }
    } )

    this.stopCandidate=null

    this.update()
  }

  update() {
    if (!this.editingPlaceId && this.state.showEditor!==null)
      this.setState({
        showEditor: null
      })

    this.setState({
      updateMap: this.state.updateMap + 1
    })
  }

  _onStopChange(stopEssential, orders) {
    if(orders.length > 0) {
      this._getStopDetailInformation(stopEssential)
        .then(detail => {
          console.log(this.stops)
          orders.map(({order}) => {
            this.stops[order].stopDetail = detail.result
          })
          this.editingPlaceId = detail.result.place_id
          this._updateMarker()
          this._getDirections()
        })
    }
    else{
      this._setStopCandidate(stopEssential)
        .then(() => this.update())
        .catch(error => 
          console.log(error))
    }
  }

  _getStopDetailInformation(stopEssential){
    return googleMapService('place/details', `place_id=${stopEssential.place_id}`)
  }

  _setStopCandidate(stopEssential) {
    return this._getStopDetailInformation(stopEssential)
      .then(detail => {
        this.stopCandidate = detail.result
        this.editingPlaceId = detail.result.place_id
      })
  }

  _getRecommandDuration(place_id){
    return {
      days:0,
      hours:1,
      minutes:0
    }
  }

  _addStop = (stopDetail) => {
    if(this.stopMarkers.length > 1 || (this.stopMarkers.length === 1 && !this._getMarkerByPlaceId(stopDetail.place_id))) {
        Alert.alert(
          'Add new stop',
          'Press \'Add\' to append to the end of route, or \'Insert to...\' to front of an existing stop.',
          [
            {
              text: 'Cancle',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Add',
              onPress: () => {
                this.stops.push({stopDetail:stopDetail, duration:this._getRecommandDuration(stopDetail.place_id)})
                this._updateMarker()
                this._getDirections()
              }
            },
            {
              text: 'Insert to...', 
              onPress: () => {
                this._insertStop({stopDetail:stopDetail, duration:this._getRecommandDuration(stopDetail.place_id)})
              }
            }
          ],
          {cancelable: false},
        )
    } else {
      this.stops.push({stopDetail:stopDetail, duration:this._getRecommandDuration(stopDetail.place_id)})
      this._updateMarker()
      this._getDirections()
    }
  }

  _insertStop(stop) {
    Alert.alert(
      null,
      "Select stop which you like to insert front to",
      this._listStopWithName()
    )
  }

  _listStopWithName() {
    const list =  this.stops.map(({stopDetail}, index) => {
      return {
        text: "Stop " + index + " - " + stopDetail.name,
        onPress: (e => {
          console.log("stop #" + index + " is selected")
        })
      }
    })
    list.push({
      text: 'Cancle',
      onPress: () => console.log('Cancel Pressed'),
      style: 'cancel',
    })
    return list
  }

  _editStop = (marker) => {
    this._openStopEditModal(marker)
  }

  _removeStop(order) {
    const removedStop = this.stops.splice(order, 1)
    if(removedStop) {
      this._updateMarker()
      this._getDirections()

      // if coordinate doesn't exist any more, close edit modal.
      const marker = this._getMarkerByPlaceId(removedStop[0].stopDetail.place_id)
      if(!marker) {
        this._closeStopEditModal()
      }
    }
  }

  _getMarkerByPlaceId(place_id) {
    return this.stopMarkers.find(marker => {
      return marker.props.stopDetail.place_id === place_id
    })
  }

  render() {
    return (
      <Container style={styles.container}>
        {this._renderMap()}
        {this._renderMarkerEditView()}
      </Container>
    )
  }
  
  _renderMarkerEditView() {
    return(<MarkerEditView mapView = {this} />)
  }

  _openStopEditModal = (marker) => {
    this._setCurrentEditPlaceId(marker.props.stopDetail.place_id)
    this.setState({showEditor: "Marker"})
  }

  _closeStopEditModal = () => {
    if(this.selectedRoute !== null)
      this.selectedRoute = null

    if(this.editingPlaceId !== null){
      this._setCurrentEditPlaceId(null)
      this.setState({showEditor: null})
    }
    
    if(this.state.showEditor !== null)
      this.setState({showEditor: null})
  }

  _isStopEditModalVisible = () => this.state.showEditor==="Marker";
}


const styles = StyleSheet.create({
  container: {
    //position: 'absolute',
    width: Dimensions.get('window').width,
    //height: Dimensions.get('window').height,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  overallViewContainer: {
    flex: 1,
    width: Dimensions.get('window').width,
    //height: Dimensions.get('window').height,
  },
  earchInput: {
    alignItems: 'center',
    width: '100%'
  },
  mapView: {
    flex: 1,
    height: '100%'
  }
});

