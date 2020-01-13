import React from 'react'
import { View, StyleSheet } from "react-native";
import MapView,  {PROVIDER_GOOGLE, Marker } from 'react-native-maps'

import AutoCompleteSearchInput from '../../AutoCompleteSearchInput'

/**
 * 
 */
export default class MapWindow extends React.Component {
  map = null

  constructor(props) {
    super(props)
    
    this.state = {
      initialLocationCoordinates: this.props.initCoordinates
    }
  }

  render() {
    return(
      <View style={styles.content}>
        <AutoCompleteSearchInput notifyLocationChange={this.notifyLocationChange} style={{width: 300}}/>
        <MapView
          ref = {map=> this.map = map }
          style={styles.mapView}
          provider={ PROVIDER_GOOGLE }
          initialRegion={this.state.initialLocationCoordinates}
        >
          <Marker coordinate={this.state.initialLocationCoordinates}/>
        </MapView>
      </View>
    )
  }
  
  notifyLocationChange = (stop) => {
    this.props.callback(stop)
    
    this.setState({ 
      initialLocationCoordinates: {
        ...this.state.initialLocationCoordinates, 
        latitude: stop.stopDetail.geometry.location.lat,
        longitude: stop.stopDetail.geometry.location.lng
      }
    })

    this.map.animateToRegion(this.state.initialLocationCoordinates)
  }
}

const styles = StyleSheet.create({
    content: {
      height: 300,
      //fontSize: 12,
      //marginBottom: 12,
    },
    mapView: {
      flex: 1,
      height: '100%'
    }
  });