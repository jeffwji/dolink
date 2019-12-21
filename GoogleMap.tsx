import React from 'react'
import MapView, {PROVIDER_GOOGLE, Marker, Callout, CalloutSubview, Polyline } from 'react-native-maps'
import StopMarker from './StopMarker'
import {NavigationInjectedProps} from 'react-navigation';
import Modal from 'react-native-modal';

type Props = NavigationInjectedProps;

import {
  Container,
  Item,
  Button
} from 'native-base'

import {
  View,
  Dimensions,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'

import MapSearchInput from './MapSearchInput';
import polyline from '@mapbox/polyline'

import GLOBAL, {askPermission, query, googleMapService, REACT_APP_GOOGLE_MAPS_API, REACT_APP_GOOGLE_PLACES_API} from './Global'

// For stop edit
type State = {
  stopEditScrollOffset: null | number;
  stopEditModalVisiblity: boolean;
};
//

export default class GoogleMap extends React.Component<State> {
  // For stop edit
  public stopEditScrollViewRef: React.RefObject<ScrollView>;
  //

  constructor(props) {
    super(props, {
      // For stop edit
      stopEditScrollOffset: null,
      //
    })
    
    this.state = {
      updateMap: 0,
      // for stop edit
      stopEditModalVisiblity: false
      //
    }

    // For stop edit
    this.stopEditScrollViewRef = React.createRef();
    //
  }

  // For stop edit
  editingCoordinate = null
  //
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

  _resetStopCandidate(stop) {
    this._setStopCandidate(stop)
      .then(() =>
        this._updateCurrentLocation({
          latitude: stop.geometry.location.lat,
          longitude: stop.geometry.location.lng,
          latitudeDelta: this.currentLocationCoordinates.latitudeDelta,
          longitudeDelta: this.currentLocationCoordinates.longitudeDelta
        }, true)
      )
      .catch(error => console.log(error))
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
                .then(() => this.update())
                .catch(error => console.log(error))
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
            editStop = {(marker) => this._addInterestedLocation(marker.props.stopDetail)}
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
            editStop = {(marker) => this._editStop(marker)}
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
              editStop = {(marker) => this._editStop(marker)}
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
    if (!this.editingCoordinate && this.state.isStopEditModalVisible)
      this.setState({
        isStopEditModalVisible: false
      })

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
      this.update()
    }
    else{
      this._setStopCandidate(stopDetail)
        .then(() => this.update())
        .catch(error => console.log(error))
    }
  }

  _setStopCandidate = (stopDetail) => {
    // this.stopCandidate = stopDetail
    return googleMapService('place/details', `place_id=${stopDetail.place_id}`)
          .then(detail => 
            this.stopCandidate = detail.result
          )
  }

  _addInterestedLocation = (stopDetail) => {
    this.stops.push(stopDetail)
    this._updateMarker()
    this._getDirections()
  }

  _editStop = (marker) => {
    this.openStopEditModal(marker)
  }

  _removeStop(order) {
    const removedStop = this.stops.splice(order, 1)
    if(removedStop) {
      this._updateMarker()
      this._getDirections()

      // if coordinate doesn't exist any more, close edit modal.
      const marker = this._getMarkerByCoordinate(removedStop[0].geometry.location)
      if(!marker) {
        this.editingCoordinate = null
        this.closeStopEditModal()
      }
    }
  }

  _getMarkerByCoordinate(coordinate) {
    return this.stopMarkers.find(marker => {
      const location = marker.props.stopDetail.geometry.location
      return (location.lat === coordinate.lat) && (location.lng === coordinate.lng)
    })
  }

  render() {
    return (
      <Container style={styles.container} 
        onClick = { e => 
          console.log(e)
        }
      >
        {this._renderMap()}
        {this._renderModal()}
      </Container>
    )
  }

  ////////////////////////////////
  // Stop edit modal
  //
  _renderModal(): React.ReactElement<any> {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        isVisible={this.isStopEditModalVisible()}
        //swipeDirection={['left','right']}
        //onSwipeComplete={this.closeStopEditModal}
        backgroundColor = 'transparent'
        scrollTo={this.handleScrollTo}
        scrollOffset={this.state.stopEditScrollOffset}
        scrollOffsetMax={400 - 300} // content height - ScrollView height
        style={styles.modal}
        // onRequestClose={() => {this.closeStopEditModal}}
        >
        <TouchableOpacity 
          style={{
            flex: 1,
            justifyContent: 'flex-end'
          }} 
          activeOpacity={1} 
          onPressOut={() => {
            this.closeStopEditModal()
          }}
        >
        <View>
          <ScrollView style={styles.scrollableModal}
            ref={this.stopEditScrollViewRef}
            onScroll={this.handleOnScroll}
            scrollEventThrottle={16}>
              <TouchableWithoutFeedback>
                <View>
                {
                  this.renderMarkerEdit()
                }
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  renderMarkerEdit() {
    if(this.editingCoordinate) {
      const m = this._getMarkerByCoordinate(this.editingCoordinate)
      if(m) {
        const content = m.props.orders.map((order, index) => 
          <View key={index} style={styles.scrollableModalContent1}>
            <Button onPress={() => {
              this._removeStop(order)
            }}>
              <Text style={styles.scrollableModalText1}>Remove stop {order}</Text>
            </Button>
          </View>
        )
        return content
      }
    }
    else if (this.state.isStopEditModalVisible)
      this.closeStopEditModal()
  }

  openStopEditModal = (marker) => {
    this.editingCoordinate = marker.props.stopDetail.geometry.location
    this.setState({stopEditModalVisiblity: true} as any)
  }

  closeStopEditModal = () => {
    this.editingCoordinate = null
    this.setState({stopEditModalVisiblity: false} as any)
  }

  isStopEditModalVisible = () => this.state.stopEditModalVisiblity;

  handleScrollTo = p => {
    if (this.stopEditScrollViewRef.current) {
      this.stopEditScrollViewRef.current.scrollTo(p);
    }
  }

  handleOnScroll = event => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    });
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

  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  scrollableModal: {
    height: 300,
  },
  scrollableModalContent1: {
    height: 200,
    backgroundColor: '#87BBE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableModalText1: {
    fontSize: 20,
    color: 'white',
  },
  scrollableModalContent2: {
    height: 200,
    backgroundColor: '#A9DCD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableModalText2: {
    fontSize: 20,
    color: 'white',
  },
});

