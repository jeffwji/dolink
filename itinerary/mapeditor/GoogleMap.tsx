import React from 'react'
import MapView, {PROVIDER_GOOGLE, Polyline } from 'react-native-maps'
import StopMarker from './StopMarker'
import EditView from './editpanel/EditView'

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

//import MapSearchInput from './MapSearchInput';
import MapSearchInput from './AutoCompleteSearchInput'
import polyline from '@mapbox/polyline'
import MapController from './MapController'
import NearBySearch from './NearBySearch'

import {askPermission, googleMapService} from '../../util/Global'
import {getRegion} from '../../util/Location'

type State = {
  showEditor: string;
};

export default class GoogleMap extends React.Component<State> {
  constructor(props) {
    super(props)
    
    this.state = {
      updateMap: false,
      showEditor: null,
      showMarkerDetail: 1,
    }
  }

  defaultRadius = 10000

  map = null
  find_food_entertainment = false

  defaultRouteColor = 'rgba(255, 20, 147, 0.4)'  // 'hotpink'
  selectedRouteColor = 'blue'
  invalidRouteColor = 'rgba(105,105,105,0.4)' //'gray'
  privacyRouteColor = 'rgba(128,0,12, 0.4)'  //'purple'

  editingPlaceId = null
  selectedRoute = null
  editView = null

  currentLocationCoordinates = null
  directions = []
  routes = []
  // stops = []
  stopMarkers = []
  stopCandidate = null
  mapController = <MapController mapView={this} />

  nearBySearch = new NearBySearch({mapView: this})

  componentDidMount () {
    if(this.currentLocationCoordinates==null ) {
      this._getCurrentPosition()
    }
  }

  stops = this.props.navigation.state.params.stops
  updateStops = this.props.navigation.state.params.updateStops
  setStops = this.props.navigation.state.params.setStops

  getDefaultRadius() {
    return this.defaultRadius
  }

  _setShowMarkerDetail(level){
    this.setState({showMarkerDetail: level})
  }

  _setFindFoodEntertainment(){
    if(this.find_food_entertainment){
      this.find_food_entertainment = false
      this.update()
    } else {
      this.find_food_entertainment = true
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
            const region = getRegion(data.coords.latitude, data.coords.longitude, this.getDefaultRadius())
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
      this.forceUpdate()
  }

  _renderMap() {
    if(this.currentLocationCoordinates!=null) {
      return(
        <View style={styles.overallViewContainer}>
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

          <MapView style={styles.mapView}
            ref = {map=> this.map = map }
            provider={ PROVIDER_GOOGLE }
            region={this.currentLocationCoordinates}
            /*onRegionChange={region => {
              console.log('onRegionChange', region)
            }}*/
            initialRegion={this.currentLocationCoordinates}
            onRegionChangeComplete={region => {
              this._updateCurrentLocation(region, false)
              // this._afterRegionChange()
            }}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true}
            followUserLocation={true}
            onMarkerPress = {e => {
              this.map.animateToRegion({
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                latitudeDelta: this.currentLocationCoordinates.latitudeDelta,
                longitudeDelta: this.currentLocationCoordinates.longitudeDelta
              })
            }}
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
                  //this._setCurrentEditPlaceId(poi.placeId)
                  this.setShowEditorMode("Marker")
                })
                .then(() => {
                  this.map.animateToRegion({
                    latitude: poi.coordinate.latitude,
                    longitude: poi.coordinate.longitude,
                    latitudeDelta: this.currentLocationCoordinates.latitudeDelta,
                    longitudeDelta: this.currentLocationCoordinates.longitudeDelta
                  })
                  this.update()
                })
                .catch(error => console.log(error))
            }}
            onPress={ e=> {
              if(!e.nativeEvent.action || e.nativeEvent.action === 'press') {
                this._closeStopEditModal()
              }
            }}
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
            {this._renderInterestings()}
            {this._renderMarkers()}
            {this._renderCurrentMarker()}
          </MapView>

          {this.mapController}
        </View>
      )
    }
  }

  _afterRegionChange() {
    this.nearBySearch.updateFoodAndEntertainment()
  }

  _renderInterestings() {
    return this._renderFoodEntertainment()
  }

  _renderFoodEntertainment(){
    if(this.find_food_entertainment){
      const results = []
      const food_entertainment = this.nearBySearch.getInterestings('food_entertainment')
      for(let key in food_entertainment) {
        if (Object.prototype.hasOwnProperty.call(food_entertainment, key)) {
          food_entertainment[key].map(value => {
            results.push(value)
          })
        }
      }

      return results.filter(result => {
        const r = this.stopMarkers.findIndex(marker => marker.props.stopDetail.place_id === result.props.detail.place_id)
        return r===-1
      })
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
      orders = {orders}
      editStop = {(marker) => this._editStop(marker)}
      onStopLocationChange = {(stopDetail, orders) => this._onStopChange(stopDetail, orders)}
      showDetail = {() => {return this.state.showMarkerDetail}}
    />
  }

  _renderMarkers() {
    return(
      this.stopMarkers
    )
  }

  async _getDirections() {
    this.directions= []

    if(this.stops().length > 1){
      const temp_stops = this.stops().map((stop, index) => {
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

  _generateFlightRoute(origin, dest) {
    return {
      route:[{
        latitude:origin.stop.stopDetail.geometry.location.lat,
        longitude:origin.stop.stopDetail.geometry.location.lng
      },{
        latitude:dest.stop.stopDetail.geometry.location.lat,
        longitude:dest.stop.stopDetail.geometry.location.lng
      }],
      legs:[
        {
          distance: {text:null, value: null},
          duration: {text:null, value: null}
        }
      ],
      destination: dest.index,
      origin: origin.index,
      routeable: false
    }
  }

  async _getDirection(origin, dest) {
    if(origin.stop.stopDetail.place_id != dest.stop.stopDetail.place_id){
      const mode = dest.stop.transit_mode?dest.stop.transit_mode:'driving'
      switch(mode){
        case 'flight':
            this.directions.push(this._generateFlightRoute(origin, dest))
            return
        default:
          return googleMapService("directions", `origin=${this._coords2string(origin.stop.stopDetail.geometry.location)}&destination=${this._coords2string(dest.stop.stopDetail.geometry.location)}&mode=${mode}`)
            .then(resp => {
              if (resp.routes.length > 0) {
                this.directions.push({route:resp.routes[0], destination: dest.index, origin: origin.index, routeable: true})
              } else {
                this.directions.push(this._generateFlightRoute(origin, dest))
              }
            })
            .catch(e => {
              console.warn(e)
            })
       }
    }
  }

  _setTransitMode(stopIndex, mode) {
    this.updateStops( stops => stops[stopIndex].transit_mode=mode )
    //this.stops[stopIndex].transit_mode=mode
  }

  _getTransitMode(stopIndex) {
    return this.stops()[stopIndex].transit_mode?this.stops()[stopIndex].transit_mode:'driving'
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
              this.setShowEditorMode("Route")
            }}
            geodesic={false}
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
              this.setShowEditorMode("Route")
            }}
            geodesic={true}
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
    
    this.stops().map(({stopDetail, duration}, index) => {
      const i = this.stopMarkers.findIndex(marker => {
        const s = marker.props.stopDetail
        return (s.place_id == stopDetail.place_id)
      })

      if (i < 0){
        const stopMarker = this._newMarker(stopDetail, index, '#f44336', [{order:index, duration: () => this.stops()[index].duration }]) //duration}])
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
          const orders = marker.props.orders.concat({order:index,  duration: () => this.stops()[index].duration })
          const stopMarker = this._newMarker(stopDetail, marker.key, '#f44336', orders)
          this.stopMarkers.push(stopMarker)
        }
      }
    } )

    this.stopCandidate=null

    this.update()
  }

  update() {
    if (!this.editingPlaceId && this._isEditViewVisible())
    this.setShowEditorMode(null)

    this.setState({
      updateMap: !this.state.updateMap
    })
  }

  reflashStops(stops){
    this.setStops(stops)
    this._updateMarker()
    this._getDirections()
  }

  updateStop(stopDetail, order){
    this.updateStops( stops => stops[order].stopDetail = stopDetail )
    //this.stops[order].stopDetail = stopDetail
    this._updateMarker()
    this._getDirections()
  }

  _onStopChange(stopEssential, orders) {
    if(orders.length > 0) {
      this._getStopDetailInformation(stopEssential)
        .then(detail => {
          orders.map(({order}) => {
            this.updateStops( stops => stops[order].stopDetail = detail.result )
            // this.stops[order].stopDetail = detail.result
          })
          this._setCurrentEditPlaceId(detail.result.place_id)
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
        this._setCurrentEditPlaceId(detail.result.place_id)
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
    this.updateStops( stops => stops.push({stopDetail:stopDetail, duration:this._getRecommandDuration(stopDetail.place_id)}) )
    //this.stops.push({stopDetail:stopDetail, duration:this._getRecommandDuration(stopDetail.place_id)})
    this._updateMarker()
    this._getDirections()
  }

  _insertStop(stop) {
    Alert.alert(
      null,
      "Select stop which you like to insert front to",
      this._listStopWithName()
    )
  }

  _listStopWithName() {
    const list =  this.stops().map(({stopDetail}, index) => {
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
    const removedStop = this.stops().splice(order, 1)
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
        {this._renderEditView()}
      </Container>
    )
  }
  
  _renderEditView() {
    return(this.editView)
  }

  _openStopEditModal = (marker) => {
    this._setCurrentEditPlaceId(marker.props.stopDetail.place_id)
    this.setShowEditorMode("Marker")
  }

  setShowEditorMode(mode, parameters=null) {
    this.editView = <EditView mapView = {this} parameters={parameters} />
    this.setState({showEditor: mode})
  }

  _closeStopEditModal = () => {
    if(this.selectedRoute !== null)
      this.selectedRoute = null

    if(this.editingPlaceId !== null){
      this._setCurrentEditPlaceId(null)
      this.setShowEditorMode(null)
    }
    
    if(this._isEditViewVisible())
    this.setShowEditorMode(null)
  }

  _isEditViewVisible = () => this.state.showEditor!==null;
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

