import React from 'react'
import { Button, Text, View, StyleSheet, TouchableOpacity} from "react-native";

import ChangeStopModalAbstract from './ChangeStopModalAbstract'

/**
 * 
 */
export default class ChangeStartEndModal extends ChangeStopModalAbstract {
  stopDetail = null

  _getStopDetail() {
    return this.props.location
  }

  _onClose(update) {
    if(update) {
      if(this.stopDetail !== null){
          /*const {order} = this.props.parameters
          this.props.mapView.updateStop(this.stopDetail, order)
          this.props.mapView._updateInitialLocation({
            latitude: this.stopDetail.geometry.location.lat,
            longitude: this.stopDetail.geometry.location.lng,
            latitudeDelta: this.props.mapView.initialLocationCoordinates.latitudeDelta,
            longitudeDelta: this.props.mapView.initialLocationCoordinates.longitudeDelta
          }, true)*/
          this.props.mapView.setStartLocation({
            ...this.props.mapView.startLocation(),
            stopDetail: this.stopDetail,
            describe: this.stopDetail.formatted_address,
            type: 'MANUAL_INPUT'
          })
          
          this.props.mapView._updateInitialLocation({
            latitude: this.stopDetail.geometry.location.lat,
            longitude: this.stopDetail.geometry.location.lng,
            latitudeDelta: this.props.mapView.initialLocationCoordinates.latitudeDelta,
            longitudeDelta: this.props.mapView.initialLocationCoordinates.longitudeDelta
          }, true)
        }
    }

    this.props.close()
  }

  updateStopOrder(stops) {
    console.log('')
  }

  updateStopDetail(stopDetail) {
    this.stopDetail = stopDetail
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
