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
  Dimensions
} from 'react-native'

import {googleImageService, googleMapService} from './Global'
import DaytimePicker from './DaytimePicker'

export default class MarkerEditView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      reload: false,
      placeImageIndex: 0,
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
                {
                  this._renderMarkerStops(m)
                }
                </View>
            </ScrollView>
          </View>
        )
      }
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

