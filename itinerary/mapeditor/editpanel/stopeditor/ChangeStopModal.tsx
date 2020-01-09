import React from 'react'
import { Button, Text, View, StyleSheet, TouchableOpacity} from "react-native";


import Modal from "react-native-modal";

import MapWindow from './MapWindow'
import ChangeStopOrder from './ChangeStopOrder'

/**
 * 
 */
export default class ChangeStopModal extends React.Component {
  stops = null
  stopDetail = null

  render(){
    return (
      <Modal
        isVisible={true}
        onBackdropPress= {() => {
          this._onClose(false)
        }}
      >
        <View style={styles.container}>
          {this._renderContent()}
          <View style={{flexDirection: 'row', backgroundColor: '#E1E9FD'}}>
            <Button transparent 
              style={{flex:1}} 
              title="Cancel" 
              onPress={() => {
                this._onClose(false)
              } }
            />
            <Button transparent 
              style={{flex:1}} 
              title="Ok" 
              onPress={() => {
                this._onClose(true)
              }}
            />
          </View>
        </View>
      </Modal>
    )
  }

  _onClose(update) {
    if(update) {
      if(this.props.mode === 'CHANGE_ORDER'){
        if(this.stops !== null)
          this.props.mapView.reflashStops(this.stops)
      } else if(this.props.mode === 'CHANGE_LOCATION') {
        if(this.stopDetail !== null){
          const {order} = this.props.parameters
          this.props.mapView.updateStop(this.stopDetail, order)
          this.props.mapView._updateCurrentLocation({
            latitude: this.stopDetail.geometry.location.lat,
            longitude: this.stopDetail.geometry.location.lng,
            latitudeDelta: this.props.mapView.currentLocationCoordinates.latitudeDelta,
            longitudeDelta: this.props.mapView.currentLocationCoordinates.longitudeDelta
          }, true)
        }
      }
    }

    this.props.close()
  }

  updateStopOrder(stops) {
    this.stops = stops
  }

  updateStopDetail(stopDetail) {
    this.stopDetail = stopDetail
  }

  _renderContent(){
    if(this.props.mode === 'CHANGE_ORDER'){
      return(
        <ChangeStopOrder 
          stops={this.props.mapView.stops()} 
          callback={stops => this.updateStopOrder(stops)}
        />
      )
    } else if(this.props.mode === 'CHANGE_LOCATION') {
      const {order} = this.props.parameters
      const latlng = this.props.mapView.stops()[order].stopDetail.geometry.location
      const currentLocationCoordinates = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        latitudeDelta: this.props.mapView.currentLocationCoordinates.latitudeDelta,
        longitudeDelta: this.props.mapView.currentLocationCoordinates.longitudeDelta
      }

      return(
        <MapWindow
          stopDetail = {this.props.mapView.stops()[order]}
          initCoordinates={currentLocationCoordinates}
          callback={stops => this.updateStopDetail(stops)}
        />
      )
    }
  }
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    padding: 5,
    color: 'blue',
    fontSize: 16,
  }
});
