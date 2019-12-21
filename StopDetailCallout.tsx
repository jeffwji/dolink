import React from 'react'
import { Callout, CalloutSubview } from 'react-native-maps'
import CustomCallout from './CustomCallout'
import PropTypes from 'prop-types';

import {
  Button,
  Label
} from 'native-base'

import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Text
} from 'react-native'

import {googleMapService, googleImageService} from './Global'


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
        {this._renderCallout()}
        </CustomCallout>
      </Callout>
    )
  }

  _renderCallout() {
    if(this.props.orders.length === 0) {
        return(
          <View>
            <PhotoView stopDetail={this.props.stopDetail} />
            <Text style={[styles.orders, { fontSize: 13 }]}>{this.props.stopDetail.description || this.props.stopDetail.formatted_address || this.props.stopDetail.name}</Text> 
            { /*<CalloutSubview onPress={() => this.props.editStop()}></CalloutSubview> */}
            <Text>Click to Add</Text>
          </View>
        )
    } /*else {
        return(
          <View>
            {this._renderStops(this.props.orders)}
          </View>
        )
    }*/
  }

  _renderStops(orders) {
    return(
      <View>
        <Text style={[styles.orders, { fontSize: 13 }]}>{this.props.stopDetail.description || this.props.stopDetail.formatted_address || this.props.stopDetail.name}</Text> 
        { /* <CalloutSubview onPress={() => {this.props.editStop()}}></CalloutSubview> */ }
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
      /*if(this.props.stopDetail.place_id != this.current_place_id) {
        this.photos = null
        googleMapService('place/details', `place_id=${this.props.stopDetail.place_id}`)
          .then(detail => {
            this.current_place_id = this.props.stopDetail.place_id
            this.photos = detail.result.photos
            this.setState({placeImageIndex: 0})
          })
          .catch(error => console.log(error))
      }*/
        
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
  });