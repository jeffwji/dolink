import React from 'react'
import { Button, Text, View, StyleSheet, TouchableOpacity} from "react-native";


import Modal from "react-native-modal";

import MapWindow from './MapWindow'
import ChangeStopOrder from './ChangeStopOrder'


export interface ChangeStopInterface {
    _getStopDetail()
    _onClose(update)
    updateStopOrder(stops)
    updateStopDetail(stopDetail)
}

/**
 * 
 */
export default abstract class ChangeStopModalAbstract extends React.Component implements ChangeStopInterface{
  //stops = null
  //stopDetail = null

  abstract updateStopOrder(stops)
  abstract _getStopDetail()
  abstract _onClose(update)
  abstract updateStopDetail(stopDetail)

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

  _renderContent(){
    if(this.props.mode === 'CHANGE_ORDER'){
      return(
        <ChangeStopOrder 
          stops={this.props.mapView.stops()} 
          callback={stops => this.updateStopOrder(stops)}
        />
      )
    } else if(this.props.mode === 'CHANGE_LOCATION') {
      const stop = this._getStopDetail()
      const latlng = stop.stopDetail.geometry.location
      
      const initialLocationCoordinates = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        latitudeDelta: this.props.mapView.initialLocationCoordinates.latitudeDelta,
        longitudeDelta: this.props.mapView.initialLocationCoordinates.longitudeDelta
      }

      return(
        <MapWindow
          stopDetail = {stop}
          initCoordinates={initialLocationCoordinates}
          callback={stop => this.updateStopDetail(stop)}
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
