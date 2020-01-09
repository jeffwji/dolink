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
      currentLocationCoordinates: this.props.initCoordinates
    }
  }

  render() {
    return(
      <View style={styles.content}>
        <AutoCompleteSearchInput notifyLocationChange={this.notifyLocationChange} containerStyle={{width: 300}}/>
        <MapView
          ref = {map=> this.map = map }
          style={styles.mapView}
          provider={ PROVIDER_GOOGLE }
          initialRegion={this.state.currentLocationCoordinates}
        >
          <Marker coordinate={this.state.currentLocationCoordinates}/>
        </MapView>
      </View>
    )
  }
  
  notifyLocationChange = (details) => {
    this.props.callback(details)
    
    this.setState({ 
      currentLocationCoordinates: {
        ...this.state.currentLocationCoordinates, 
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng
      }
    })

    this.map.animateToRegion(this.state.currentLocationCoordinates)
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