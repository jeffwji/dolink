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
  ScrollView,
  StyleSheet,
  Text
} from 'react-native'


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
            style={{width:220, height:100}}
            onPress={e => {
              if ( e.nativeEvent.action === 'marker-inside-overlay-press' || e.nativeEvent.action === 'callout-inside-press' ) {
                return;
              }
            }}
          >
            <CustomCallout>
                <View>
                    {
                        console.log(this.props.stopDetail)
                    }
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
              <ScrollView>
                {this.props.orders.map( (order, index) => this._renderStops(order, index) )}
              </ScrollView>
            </CustomCallout>
          </Callout>
        )
      }
    }
    _renderPicture(detail) {
        
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
  

const styles = StyleSheet.create({
    customCallout: {
      width: 250,
      paddingHorizontal: 0,
      paddingVertical: 0,
      borderRadius: 12,
      alignItems: 'flex-end',
      marginHorizontal: 0,
      marginVertical: 0,
    }
  });
  
  