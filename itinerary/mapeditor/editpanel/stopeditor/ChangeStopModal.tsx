import React from 'react'
import { Button, Text, View, StyleSheet, TouchableOpacity} from "react-native";

import ChangeStopModalAbstract from './ChangeStopModalAbstract'

/**
 * 
 */
export default class ChangeStopModal extends ChangeStopModalAbstract {
  _getStopDetail() {
    const {order} = this.props.parameters
    return this.props.mapView.stops()[order]
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
          this.props.mapView._updateInitialLocation({
            latitude: this.stopDetail.geometry.location.lat,
            longitude: this.stopDetail.geometry.location.lng,
            latitudeDelta: this.props.mapView.initialLocationCoordinates.latitudeDelta,
            longitudeDelta: this.props.mapView.initialLocationCoordinates.longitudeDelta
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
