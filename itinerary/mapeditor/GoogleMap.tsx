import React from 'react'
import MapView, {PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps'
import StopMarker from './markers/StopMarker'
import EditView from './editpanel/EditView'

import {
  Container
} from 'native-base'

import {
  View,
  Dimensions,
  StyleSheet,
  Alert
} from 'react-native'

import AutoCompleteSearchInput from './AutoCompleteSearchInput'
import polyline from '@mapbox/polyline'
import MapController from './MapController'
import NearBySearch from './NearBySearch'

import {askPermission, googleMapService, getLocation} from '../../util/Global'
import {getRegion, coordinate2string, generateFlightRoute} from '../../util/Location'
import StartEndMarker from './markers/StartEndMarker'

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

    this._updateMarker()
  }

  searchInput = <AutoCompleteSearchInput 
      notifyLocationChange={(stop) => {
        this._setStopCandidate(stop.stopDetail)
          .then(() =>
            this._updateInitialLocation({
              latitude: stop.stopDetail.geometry.location.lat,
              longitude: stop.stopDetail.geometry.location.lng,
              latitudeDelta: this.initialLocationCoordinates.latitudeDelta,
              longitudeDelta: this.initialLocationCoordinates.longitudeDelta
            }, true)
          )
          .catch(error => console.log(error))
      }}
      defaultLocations={[
        { description: 'Home', geometry: { location: { lat: 43.8906719, lng: -79.2964162 } }, place_id: 'ChIJ1bQTc_zV1IkR_pQs6RrmKzo', isPredefinedPlace: true, name: 'Stonebridge Public School, Stonebridge Drive, Markham, ON, Canada'}
      ]}
    />

  defaultRadius = 10000

  gmap = null
  find_food_entertainment = false

  defaultRouteColor = 'rgba(255, 20, 147, 0.4)'  // 'hotpink'
  selectedRouteColor = 'rgba(255, 20, 147, 1)'
  privacyRouteColor = 'rgba(153,51,255, 0.4)'  //'purple'
  selectedPrivacyRouteColor = 'rgba(153,51,255, 1)'
  invalidRouteColor = 'rgba(105,105,105,0.4)' //'gray'
  selectedInvalidRouteColor = 'rgba(105, 105, 105, 1)' //'gray'

  editingPlaceId = null
  selectedRoute = null
  editView = null

  //currentLocation = null
  initialLocationCoordinates = null
  routes = []
  stopMarkers = []
  stopCandidate = null
  mapController = <MapController mapView={this} />

  nearBySearch = new NearBySearch({mapView: this})

  componentDidMount () {
    if(this.initialLocationCoordinates==null ) {
      this._getCurrentPosition()
    }
  }

  currentLocation = this.props.navigation.state.params.currentLocation
  setCurrentLocation = this.props.navigation.state.params.setCurrentLocation

  startLocation = this.props.navigation.state.params.startLocation
  setStartLocation = this.props.navigation.state.params.setStartLocation

  endLocation = this.props.navigation.state.params.endLocation
  setEndLocation = this.props.navigation.state.params.setEndLocation

  stops = this.props.navigation.state.params.stops
  updateStops = this.props.navigation.state.params.updateStops
  setStops = this.props.navigation.state.params.setStops

  directions = this.props.navigation.state.params.directions
  updateDirections = this.props.navigation.state.params.updateDirections
  setDirections = this.props.navigation.state.params.setDirections

  isEndSameToStart = this.props.navigation.state.params.isEndSameToStart

  getDirection = this.props.navigation.state.params.getDirection
  reflashDirections = this.props.navigation.state.params.reflashDirections

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
        getLocation(
          latlng => {
            this._setStartEndLocationDetail({latitude:latlng.coords.latitude, longitude: latlng.coords.longitude})
            const region = getRegion(latlng.coords.latitude, latlng.coords.longitude, this.getDefaultRadius())
            this._updateInitialLocation(region, true)
          },
          error => {
            console.log(error)
          }
        )
      }
      else throw 'No permission to obtain location'
    })
  }

  _setStartEndLocationDetail(coordinate) {
    if(this.startLocation().type === 'CURRENT_LOCATION' || this.endLocation().type === 'CURRENT_LOCATION')
      googleMapService("geocode", `latlng=${coordinate2string(coordinate)}`)
        .then(detail => {
          this.setCurrentLocation({stopDetail: detail.results[0]})
          /*if(this.startLocation().type === 'CURRENT_LOCATION') {
            this.setStartLocation({
              ...this.startLocation(),
              stopDetail: detail.results[0],
              describe: detail.results[0].formatted_address
            })
          }

          if(this.endLocation().type === 'CURRENT_LOCATION') {
            this.setEndLocation({
              ...this.endLocation(),
              stopDetail: detail.results[0],
              describe: detail.results[0].formatted_address
            })
            this.update()
          }*/
          this.update()
        })
  }

  _updateInitialLocation(region, updateMap) {
    this.initialLocationCoordinates = region
    if(updateMap)
      this.update()
  }

  _renderMap() {
    if(this.initialLocationCoordinates!=null) {
      return(
        <View style={styles.overallViewContainer}>
          {this.searchInput}

          <MapView style={styles.mapView}
            ref = {ref=> this.gmap = ref }
            provider={ PROVIDER_GOOGLE }
            region={this.initialLocationCoordinates}
            /*onRegionChange={region => {
              console.log('onRegionChange', region)
            }}*/
            initialRegion={this.initialLocationCoordinates}
            onRegionChangeComplete={region => {
              this._updateInitialLocation(region, false)
            }}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true}
            followUserLocation={true}
            onMarkerPress = {e => {
              this.gmap.animateToRegion({
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                latitudeDelta: this.initialLocationCoordinates.latitudeDelta,
                longitudeDelta: this.initialLocationCoordinates.longitudeDelta
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
                  this.setShowEditorMode("Marker")
                })
                .then(() => {
                  this.gmap.animateToRegion({
                    latitude: poi.coordinate.latitude,
                    longitude: poi.coordinate.longitude,
                    latitudeDelta: this.initialLocationCoordinates.latitudeDelta,
                    longitudeDelta: this.initialLocationCoordinates.longitudeDelta
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
                googleMapService("geocode", `latlng=${coordinate2string(e.nativeEvent.coordinate)}`)
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
            {this._renderStartMarker()}
            {this._renderEndMarker()}
            {this._renderMarkers()}
            {this._renderStopCandidateMarker()}
            {this._renderInterestings()}
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

  _newMarker(detail, key="0", color='#009688', orders=[]){
    return <StopMarker
      key = {key}
      stopDetail={detail}
      orders = {orders}
      editStop = {(marker) => this._editStop(marker)}
      onStopLocationChange = {(stopDetail, orders) => this._onStopChange(stopDetail, orders)}
      showDetail = {() => {return this.state.showMarkerDetail}}
    />
  }

  _renderStartMarker(){
    const startLocation = (this.startLocation().type==='CURRENT_LOCATION'?this.currentLocation():this.startLocation())
    if(startLocation!==null && startLocation.stopDetail!==null ){
      return(
        <StartEndMarker 
          type='Start'
          location={startLocation}
          showDetail = {(marker:StartEndMarker) => {
            this.setShowEditorMode('StartEndMarker', {marker:marker})
          }}/>
      )
    }
  }
  
  _renderEndMarker(){
    if(this.isEndSameToStart()) {
      return(null)
    }

    const endLocation = (this.endLocation().type==='CURRENT_LOCATION'?this.currentLocation():this.endLocation())
    if(endLocation!==null && endLocation.stopDetail != null){
      return(
        <StartEndMarker 
          type='End'
          location={endLocation}
          showDetail = {(marker:StartEndMarker) => {
            this.setShowEditorMode('StartEndMarker', {marker:marker})
          }}/>
      )
    }
  }

  _renderStopCandidateMarker() {
    if(this.stopCandidate != null)
      return(
        this._newMarker(this.stopCandidate)
      )
  }

  _renderMarkers() {
    return(
      this.stopMarkers
    )
  }

  _setTransitModeByIndex(stopIndex, mode) {
    if(Number.isInteger(stopIndex))
      this.updateStops( stops => stops[stopIndex].transit_mode=mode )
    else if(stopIndex === 'End'){
      this.setEndLocation({
        ...this.endLocation(),
        transit_mode: mode
      })
    }
  }

  _getTransitModeByIndex(stopIndex) {
    if(Number.isInteger(stopIndex))
      return this.stops()[stopIndex].transit_mode?this.stops()[stopIndex].transit_mode:'driving'
    else if(stopIndex === 'End')
      return this.endLocation().transit_mode?this.endLocation().transit_mode:'driving'
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

  _getRouteColor(index, isValid=true, isPrivacy=false) {
    if(!isValid) {
      if (index === this.selectedRoute)
        return this.selectedInvalidRouteColor
      else
        return this.invalidRouteColor
    } else if(isPrivacy) {
      if (index === this.selectedRoute)
        return this.selectedPrivacyRouteColor
      else
        return this.privacyRouteColor
    } else {
      if (index === this.selectedRoute)
        return this.selectedRouteColor
      else
        return this.defaultRouteColor
    }
  }

  _getRoutes() {
    this.routes = this.directions().map((direction, index) => {
      if(direction.routeable) {
        return {
          polyline: <Polyline
            key={index}
            direction={direction}
            coordinates={this._route2coords(direction.route)}
            strokeWidth={4}
            strokeColor={this._getRouteColor(index, direction.routeable, direction.privacy)}
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
            coordinates={direction.route.overview_polyline.points}
            strokeWidth={4}
            strokeColor={ this._getRouteColor(index, direction.routeable, direction.privacy)}
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
    if(this.directions().length) {
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
  }

  update() {
    if (!this.editingPlaceId && this._isEditViewVisible())
      this.setShowEditorMode(null)

    this.forceUpdate()
  }

  reflashStops(stops){
    this.setStops(stops)
    this._updateMarker()
    this.reflashDirections().then(() => this.update())
    this.update()
  }

  updateStop(stopDetail, order){
    this.updateStops( stops => stops[order].stopDetail = stopDetail )
    this._updateMarker()
    this.reflashDirections().then(() => this.update())
    this.update()
  }

  _onStopChange(stopEssential, orders) {
    if(orders.length > 0) {
      this._getStopDetailInformation(stopEssential)
        .then(detail => {
          orders.map(({order}) => {
            this.updateStops( stops => stops[order].stopDetail = detail.result )
          })
          this._setCurrentEditPlaceId(detail.result.place_id)
          this._updateMarker()
          this.reflashDirections().then(() => this.update())
          this.update()
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

    this._updateMarker()
    this.update()

    this.reflashDirections().then(() => this.update())
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
      this.reflashDirections().then(() => this.update())
      this.update()

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
    this.editView = <EditView mapView={this} parameters={parameters} />
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

