import React from 'react'

import {Marker} from 'react-native-maps'
import { StyleSheet, View, Text, Image } from 'react-native';

class FixedMarkerPin extends React.Component{
  render() {
    const content = 
        <View style={styles.container}>
          <View style={[styles.interestedBubble, {backgroundColor: this.props.color}]}>
            {this.props.contents}
          </View>
          <View style={styles.arrowBorder} />
          <View style={styles.arrow} />
        </View>
    return(content)
  }
}

export default class FixedMarker extends React.Component{
  marker = null
  
  render() {
      const detail = this.props.detail
      const coord = {latitude: detail.geometry.location.lat, longitude: detail.geometry.location.lng }
      const marker=
        <Marker
          coordinate={coord}
          ref = {marker => this.marker = marker}
          title = {detail.description || detail.formatted_address || detail.name}
          onPress={e => {
            this.props.showDetail(this)
          }}
        >
            <FixedMarkerPin 
                color={this.props.color}
                contents={this.props.onShow(detail)}
            />
        </Marker>
      return(marker)
  }
}


const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignSelf: 'flex-start',
      alignItems: 'center',
    },
    interestedBubble: {
      flex: 0,
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'flex-start',
      // backgroundColor: '#FF5A5F',
      padding: 10,
      borderRadius: 3,
      borderColor: '#D23F44',
      borderWidth: 0.5,
    },
    arrow: {
      backgroundColor: 'transparent',
      borderWidth: 4,
      borderColor: 'transparent',
      borderTopColor: '#FF5A5F',
      alignSelf: 'center',
      marginTop: -9,
    },
    arrowBorder: {
      backgroundColor: 'transparent',
      borderWidth: 6,
      borderColor: 'transparent',
      borderTopColor: '#D23F44',
      alignSelf: 'center',
      marginTop: 0.5,
    },
  });