import React from 'react'
import { Callout } from 'react-native-maps'
import CustomCallout from './CustomCallout'
import PropTypes from 'prop-types';

import {
  View,
  Image,
  StyleSheet,
  Text
} from 'react-native'

import {googleImageService} from './Global'


class StopDetailCallout extends React.Component {
  constructor(props) {
    super(props)
  }

  callout = null
    
  render() {
    return(
      <Callout alphaHitTest tooltip
        ref = {callout => this.callout = callout}
        style={{
          width:250
        }}
        onPress={e => { this.props.editStop()
          /*if ( e.nativeEvent.action === 'marker-inside-overlay-press' || e.nativeEvent.action === 'callout-inside-press' ) {
            return;
          }*/
        }}
      >
        <CustomCallout style={styles.customCallout}>
          {(this.props.orders.length===0) && 
            <View>
              <PhotoView stopDetail={this.props.stopDetail} />
              <Text style={[styles.orders, { fontSize: 13 }]}>{this.props.stopDetail.description || this.props.stopDetail.formatted_address || this.props.stopDetail.name}</Text> 
              <Text>Click to Add</Text>
            </View>
          }
        </CustomCallout>
      </Callout>
    )
  }

  _renderStops(orders) {
    return(
      <View>
        <Text style={[styles.orders, { fontSize: 13 }]}>{this.props.stopDetail.description || this.props.stopDetail.formatted_address || this.props.stopDetail.name}</Text> 
        <Text>Edit stops</Text>
      </View>
    )
  }
}
  
StopDetailCallout.propTypes = {
    orders: PropTypes.array.isRequired,
    style: PropTypes.object,
}

export default StopDetailCallout;
  

class PhotoView extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
      placeImageIndex: 0,
    }
  }

  photos = null
  current_place_id = null

  render() {
    return(
      <View style={{
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0
      }}>
        {this._renderPicture()}
      </View>
    )
  }

  _renderPicture() {
    const photos = this.props.stopDetail.photos
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
}


const styles = StyleSheet.create({
  customCallout: {
    width: 250,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 12,
    alignItems: 'flex-end',
    marginHorizontal: 0,
    marginVertical: 0,
  }
})
