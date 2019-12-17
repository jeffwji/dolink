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
      if (this.props.orders.length === 0) {
        return(
          <Callout alphaHitTest tooltip
            ref = {callout => this.callout = callout}
            style={{
                //height:100,
                width:250
            }}
            onPress={e => {
              if ( e.nativeEvent.action === 'marker-inside-overlay-press' || e.nativeEvent.action === 'callout-inside-press' ) {
                return;
              }
            }}
          >
            <CustomCallout>
              <View>
                <PhotoView stopDetail={this.props.stopDetail} />
                <Text>Add it to route</Text>
                <CalloutSubview
                  onPress={() => {
                    this.props.addRemoveOpt(this.props.stopDetail)
                  }}>
                  <Button>
                    <Label>Add</Label>
                  </Button>
                </CalloutSubview>
              </View>
            </CustomCallout>
          </Callout>
        )
      }
      else {
        return(
          <Callout alphaHitTest tooltip
            ref = {callout => this.callout = callout}
            onPress={e => {
              if ( e.nativeEvent.action === 'marker-inside-overlay-press' || e.nativeEvent.action === 'callout-inside-press' ) {
                return;
              }
            }}
          >
            <CustomCallout
              style={styles.customCallout}>
                <View>
                  <PhotoView stopDetail={this.props.stopDetail} />
                  <ScrollView>
                    {this.props.orders.map( (order, index) => this._renderStops(order, index) )}
                  </ScrollView>
                </View>
            </CustomCallout>
          </Callout>
        )
      }
    }

    _renderStops(order, index) {
      return(
          <View key={index}>
            <Text>Remove #{order} it to route</Text>
            <CalloutSubview onPress={() => {
                  this.props.addRemoveOpt(order)
                }}>
              <Button>
                <Label>Remove #{order}</Label>
              </Button>
            </CalloutSubview>
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
        if(this.props.stopDetail.place_id != this.current_place_id) {
            this.photos = null
            googleMapService('place/details', `place_id=${this.props.stopDetail.place_id}`)
                .then(detail => {
                    const parent = this._reactInternalInstance._currentElement._owner._instance;
                    this.current_place_id = this.props.stopDetail.place_id
                    this.photos = detail.result.photos
                    this.setState({placeImageIndex: 0})
                })
                .catch(error => console.log(error))
        }
        
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
        if(this.photos && this.photos.length > 0) {
            const photo = this.photos[this.state.placeImageIndex]
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