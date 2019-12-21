import React from 'react'
import Modal from 'react-native-modal';


import {
  Button
} from 'native-base'

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image
} from 'react-native'

import {googleImageService} from './Global'

////////////////////////////////
// Stop edit modal
//
type State = {
  stopEditScrollOffset: null | number;
};
  
export default class MarkerEditModal extends React.Component<State> {
  public stopEditScrollViewRef: React.RefObject<ScrollView>;
  
  constructor(props) {
    super(props, {
      stopEditScrollOffset: null,
    })
        
    this.state = {
      stopEditModalVisiblity: false,
      placeImageIndex: 0
    }
    
    this.stopEditScrollViewRef = React.createRef();
  }
  
  render() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        isVisible={this.props.mapView._isStopEditModalVisible()}
        backgroundColor = 'transparent'
        scrollTo={this._handleScrollTo}
        scrollOffset={this.state.stopEditScrollOffset}
        scrollOffsetMax={400 - 300} // content height - ScrollView height
        style={styles.modal}
      >
          <TouchableOpacity 
            style={{
              flex: 1,
              justifyContent: 'flex-end'
            }} 
            activeOpacity={1} 
            onPressOut={() => {
              this.props.mapView._closeStopEditModal()
            }}
          >
            {this._renderMarkerEdit()}
          </TouchableOpacity>
        </Modal>
      )
  }
  
  _renderMarkerEdit() {
    if(this.props.mapView.editingCoordinate) {
      const m = this.props.mapView._getMarkerByCoordinate(this.props.mapView.editingCoordinate)
      if(m) {
        return(
          <TouchableWithoutFeedback>
          <View style={{backgroundColor: '#FFFFFF'}}>
            {this._renderMarkerInformation(m)}
            <ScrollView style={styles.scrollableModal}
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
    else if (this.props.mapView.isStopEditModalVisible)
      this.props.mapView._closeStopEditModal()
  }
  
  _renderMarkerStops(marker) {
    const content = marker.props.orders.map((order, index) => 
      <View key={index} style={[styles.scrollableModalContent, {backgroundColor: (index % 2 == 0)?'#87BBE0':'#A9DCD3'}]}>
        <Button onPress={() => {
          this.props.mapView._removeStop(order)
        }}>
          <Text style={styles.scrollableModalText}>Remove stop {order}</Text>
        </Button>
        {/*<Button onPress={() => {
          this.props.mapView._addStop(marker)
        }}>
          <Text style={styles.scrollableModalText}>Add stop</Text>
      </Button>*/}
      </View>
    )
    return content
  }
  
  _renderMarkerInformation(marker) {
    return(
      <View style={{flexDirection: 'row'}}>
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
      <View style={{flexDirection: 'column'}}>
      {(detail.icon) && 
        <Image
          source={{ uri: detail.icon} }
          style={{ width: 16, height: 16 }}
        />}
      {(detail.name) && <Text>{detail.name}</Text>}
      {(detail.formatted_address) && <Text>{detail.formatted_address}</Text>}
      {(detail.formatted_phone_number) && <Text>{detail.formatted_phone_number}</Text>}
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
  scrollableModal: {
    height: 120,
  },
  scrollableModalContent: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableModalText: {
    fontSize: 20,
    color: 'white',
  }
})

