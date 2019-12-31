import React from 'react'

import {
  Button,
  Item,
  Icon
} from 'native-base'

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  Platform
} from 'react-native'

import {googleImageService, googleMapService} from './Global'
import DaytimePicker from './DaytimePicker'
import RNPickerSelect from 'react-native-picker-select'

type State = {
  stopEditScrollOffset: null | number;
  minMapViewHight: number
};

const modes = [
  { label: `Driving`, value: 'driving', key: 0, color: 'black' },
  { label: `Walking`, value: 'walking', key: 1, color: 'black' },
  { label: `Transit`, value: 'transit', key: 2, color: 'black' },
  { label: `Flight`, value: 'flight', key: 3, color: 'black' }
]



export default class MarkerEditView extends React.Component<State> {
  public stopEditScrollViewRef: React.RefObject<ScrollView>;

  constructor(props) {
    super(props, {
      stopEditScrollOffset: null
    })

    this.state = {
      reload: false,
      placeImageIndex: 0,
      minMapViewHight: Dimensions.get('window').height/1.5,
    }

    this.HEIGHT = Dimensions.get('window').height
    this.stopEditScrollViewRef = React.createRef()
    this.currentMarker = null
    this.currentPlaceId = null
  }

  render() {
    switch(this.props.mapView.state.showEditor){
      case 'Marker':
        return (
          <View style={[styles.overlay, { height: this.HEIGHT-this.state.minMapViewHight }]}>
            <View 
              style={styles.slidingBar}
              onMoveShouldSetResponder={this._handleMoveShouldSetResponder}
              onResponderMove={this._handleResponderMove}
            />
            {this._renderMarkerEdit()}
          </View>
        )
      case 'Route':
          return (
            <View style={[styles.overlay, { height: this.HEIGHT-this.state.minMapViewHight }]}>
              <View 
                style={styles.slidingBar}
                onMoveShouldSetResponder={this._handleMoveShouldSetResponder}
                onResponderMove={this._handleResponderMove}
              />
              {this._renderRouteEdit()}
            </View>
          )
      default:
        return(<View></View>)
    }
  }

  _renderRouteEdit(){
    if(this.props.mapView.selectedRoute!==null){
      const {route, destination, origin, routeable} = this.props.mapView.routes[this.props.mapView.selectedRoute].polyline.props.direction
      if(routeable) {
        const {duration, distance, start_address, end_address} = route.legs[0]
        return(
          <View>
            <Text>From: (Stop {origin+1}) {start_address}</Text>
            <Text>To: (Stop {destination+1}) {end_address}</Text>
            <Text>Distance: {distance.text}</Text>
            <Text>Duration: {duration.text}</Text>

            <Text>Transit by: </Text><RNPickerSelect
              value={this.props.mapView._getTransitMode(destination)}
              onValueChange={(v) => {
                this.props.mapView._setTransitMode(destination, v)
                this.setState({reload:!this.state.reload})
                this.props.mapView._getDirections()
              }}
              items={modes}
            />
          </View>
        )
      } else {
        const way_points = this.props.mapView.routes[this.props.mapView.selectedRoute].polyline.props.direction.way_points
        console.log(way_points)
        return(
          <View>
          </View>
        )
      }
    } else {
      return(
        <View>
        </View>
      )
    }
  }

  _handleMoveShouldSetResponder = (evt) => {
    return true;
  }

  _handleResponderMove =(evt) => {
    if(this.HEIGHT-evt.nativeEvent.pageY > 50)
      this.setState({
        minMapViewHight: Platform.OS === "android"?evt.nativeEvent.pageY-40:evt.nativeEvent.pageY
      })
    else {
      this.props.mapView._closeStopEditModal()
      this.setState({
        minMapViewHight: Dimensions.get('window').height/1.5
      })
    }
  }
  
  _renderMarkerEdit() {
    if(this.props.mapView.editingPlaceId || this.props.mapView.stopCandidate) {
      let m = this.props.mapView._getMarkerByPlaceId(this.props.mapView.editingPlaceId)
      m = m?m:this.props.mapView.stopCandidate?this.props.mapView._newMarker(this.props.mapView.stopCandidate, 0, '#009688', []):null

      if(m) {
        return(
          <TouchableWithoutFeedback>
          <View style={{backgroundColor: '#FFFFFF'}}>
            {this._renderMarkerInformation(m)}
            <ScrollView
              ref={this.stopEditScrollViewRef}
              onScroll={this._handleOnScroll}
              scrollEventThrottle={16}>
              <TouchableWithoutFeedback>
                <View>
                {
                  this._renderMarkerStops(m)
                }
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
          </TouchableWithoutFeedback>
        )
      }
    }
    
    this.props.mapView._closeStopEditModal()
    this.setState({
      minMapViewHight: Dimensions.get('window').height/1.5
    })
  }
  
  _renderMarkerStops(marker) {
    return marker.props.orders.map(({order, duration}, index) => 
      <View
        key={index} 
        style={[styles.stopEditor, {backgroundColor: (index % 2 == 0)?'#87BBE0':'#A9DCD3'}]}
      >
        <Button transparent 
          onPress={() => {
            this.props.mapView._removeStop(order)
        }}>
          <Icon name='ios-close'/>
        </Button>
        <Text style={{color:'white'}}>Stop {order+1} - Plan to stay for: </Text>
        <DaytimePicker 
          daytime = {this.props.mapView.stops[order].duration}
          updateNotify={(daytime) => {
            this.props.mapView.stops[order].duration = daytime
            this.props.mapView.update() 
          }}
        />
      </View>
    )
  }
  
  _renderMarkerInformation(marker) {
    return(
      <View style={{
        flexDirection: 'row'
      }}>
      {this._renderPicture(marker.props.stopDetail)}
      {this._renderAddress(marker.props.stopDetail)}
      </View>
    )
  }
  
  _renderPicture(detail) {
    const photos = detail.photos
    if(photos && photos.length > 0) {
      const photo = photos[this.state.placeImageIndex]
      const uri=googleImageService(photo.photo_reference, Dimensions.get('window').width/2)
      return(
        <Image
          source={{ uri: uri} }
          style={styles.scrollableModalImage}
        />
      )
    }
    else {
      return(
        <Image
          source={require('./assets/LandMarker_128-256.png')}
          style={styles.scrollableModalImage}
        />
      )
    }
  }

  _renderAddress(detail){
    return(
      <View style={{
        flex: 1,
        flexDirection: 'column'
      }}>
        <Item>
          {(detail.icon) && 
            <Image
              source={{ uri: detail.icon} }
              style={{ width: 16, height: 16 }}
            />
          }
          {(detail.name) && <Text style={styles.scrollableModalText}>{detail.name}</Text>}
        </Item>
        {(detail.formatted_address) && <Text style={styles.scrollableModalText}>{detail.formatted_address}</Text>}
        {(detail.formatted_phone_number) && <Text style={styles.scrollableModalText}>{detail.formatted_phone_number}</Text>}
        <Button // style={{alignItems: 'center'}}
          onPress={() => {
            this.props.mapView._addStop(detail)
          }}
        >
          <Text style={[styles.scrollableModalText, {alignItems: 'center'}]}>Add as new stop</Text>
        </Button>
      </View>
    )
  }

  _handleScrollTo = p => {
    if (this.stopEditScrollViewRef.current) {
      this.stopEditScrollViewRef.current.scrollTo(p);
    }
  }
  
  _handleOnScroll = event => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    });
  }
}

const styles = StyleSheet.create({
  stopEditor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollableModalText: {
    flex: 1,
    fontSize: 12,
    flexWrap: 'wrap'
  },
  scrollableModalImage: {
    width: Dimensions.get('window').width/2,
    height: Dimensions.get('window').width/2
  },
  slidingBar: {
    height: 20, 
    width: Dimensions.get('window').width, 
    backgroundColor: 'black'
  },
  overlay: {
    //flex: 1,
    //position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
    width: Dimensions.get('window').width
  }
})

