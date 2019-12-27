import React from 'react'
import StopMarker from './StopMarker'

import {
  Button,
  Item,
  Icon,
  Left,
  Right
} from 'native-base'

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Dimensions
} from 'react-native'

import {googleImageService, googleMapService} from './Global'

////////////////////////////////
// Stop edit modal
//
type State = {
  stopEditScrollOffset: null | number;
  minMapViewHight: number
};

export default class MarkerEditView extends React.Component<State> {
  public stopEditScrollViewRef: React.RefObject<ScrollView>;

  constructor(props) {
    super(props, {
      stopEditScrollOffset: null
    })

    this.state = {
      placeImageIndex: 0,
      minMapViewHight: Dimensions.get('window').height/1.5,
      reload: 0
    }

    this.HEIGHT = Dimensions.get('window').height
    this.stopEditScrollViewRef = React.createRef()
    this.currentMarker = null
    this.currentPlaceId = null
  }

  render() {
    const stopEditModalVisiblity = this.props.mapView.state.stopEditModalVisiblity
    if(stopEditModalVisiblity)
    {
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
    }
    else {
      return(<View></View>)
    }
  }

  _handleMoveShouldSetResponder = (evt) => {
    return true;
  }

  _handleResponderMove =(evt) => {
    if(this.HEIGHT-evt.nativeEvent.pageY > 50)
      this.setState({
        minMapViewHight: evt.nativeEvent.pageY
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
    } //else {
      this.props.mapView._closeStopEditModal()
      this.setState({
        minMapViewHight: Dimensions.get('window').height/1.5
      })
    //}
  }
  
  _renderMarkerStops(marker) {
    return marker.props.orders.map((order, index) => 
      <View
        key={index} 
        style={[styles.stopEditor, {backgroundColor: (index % 2 == 0)?'#87BBE0':'#A9DCD3'}]}
      >
          <Button onPress={() => {
            console.log('Stop has been updated')
          }}>
            <Text>Update</Text>
          </Button>
          <Button transparent 
            onPress={() => {
              this.props.mapView._removeStop(order)
          }}>
            <Icon name='ios-close'/>
          </Button>
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
      const uri=googleImageService(photo.photo_reference, 205, 205)
      return(
        <Image
          source={{ uri: uri} }
          style={{ width: 205, height: 205 }}
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
            />}
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
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  stopEditor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  scrollableModalText: {
    flex: 1,
    fontSize: 15,
    flexWrap: 'wrap'
  },

  slidingBar: {
    height: 20, 
    width: Dimensions.get('window').width, 
    backgroundColor: 'black'
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
    width: Dimensions.get('window').width
  }
})
