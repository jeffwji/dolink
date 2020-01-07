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
  Image,
  Dimensions,
  Alert
} from 'react-native'

import {googleImageService, googleMapService} from './Global'
import DaytimePicker from './DaytimePicker'
import ChangeStopModal from './ChangeStopModal'


export default class MarkerEditView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      reload: false,
      placeImageIndex: 0,
      changeStopModal: null
    }
  }

  render() {
      let m = this.props.mapView._getMarkerByPlaceId(this.props.mapView.editingPlaceId)
      m = m?m:this.props.mapView.stopCandidate?this.props.mapView._newMarker(this.props.mapView.stopCandidate, 0, '#009688', []):null

      if(m) {
        return(
          <View style={{backgroundColor: '#FFFFFF'}}>
            {this._renderMarkerInformation(m)}
            <ScrollView>
                <View>
                {this._renderMarkerStops(m)}
                {this._renderChangeStopMode()}
                </View>
            </ScrollView>
          </View>
        )
      } else
        return null
    }
  
  _renderMarkerStops(marker) {
    return marker.props.orders.map(({order, duration}, index) => 
      <View
        key={index} 
        style={[styles.stopEditor, {backgroundColor: (index % 2 == 0)?'#87BBE0':'#A9DCD3'}]}
      >
        <Text>Stop {order+1} - Stay for </Text>
        <DaytimePicker
          daytime = {this.props.mapView.stops[order].duration}
          updateNotify={(daytime) => {
            this.props.mapView.stops[order].duration = daytime
            this.props.mapView.update() 
          }}
        />
        <Button transparent 
          onPress={() => {
            if(this.props.mapView.stops.length > 1)
            {
              Alert.alert(
                'Change stop',
                'You want change stop order or location?',
                [
                  { text: 'Change order', onPress: () => this.setState({changeStopModal: this._createChangeStopModal('CHANGE_ORDER')}) },
                  { text: 'Change location', onPress: () => {
                      this.setState({changeStopModal: this._createChangeStopModal('CHANGE_LOCATION', {order: order})})
                    }
                  },
                  { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel',
                  },
                ],
                {cancelable: false},
              );
            } else {
              this.setState({
                changeStopModal: this._createChangeStopModal('CHANGE_LOCATION', {order: order})
              })
            }
          }}
        >
          <Icon name='ios-pin'/>
        </Button>
        <Button transparent 
          onPress={() => {
            this.props.mapView._removeStop(order)
          }}
        >
          <Icon name='ios-close'/>
        </Button>
      </View>
    )
  }

  _createChangeStopModal(mode, parameters=null) {
    const modal = <ChangeStopModal
      mode={mode}
      mapView = {this.props.mapView}
      close={() => this._closeChangeStopModal()}
      confirm={() => console.log('Confirm change') }
      parameters={parameters}
    />
    return modal
  }

  _closeChangeStopModal(){
    this.setState({
      changeStopModal: null
    })
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

  _renderChangeStopMode() {
    if (this.state.changeStopModal !== null){
      return this.state.changeStopModal
    } else
      return null
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
        <Button
          onPress={() => {
            this.props.mapView._addStop(detail)
          }}
        >
          <Text style={[styles.scrollableModalText, {alignItems: 'center'}]}>Add as new stop</Text>
        </Button>
      </View>
    )
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
  }
})

