import { StyleSheet} from "react-native";

import ChangeStopModalAbstract from './ChangeStopModalAbstract'

/**
 * 
 */
export default class ChangeStartEndModal extends ChangeStopModalAbstract {
  stop = null

  _getStopDetail() {
    return this.props.location
  }

  _onClose(update) {
    if(update) {
      if(this.stop !== null){
        if(this._getStopDetail().id === 'Start'){
          this.props.mapView.setStartLocation({
            ...this.props.mapView.startLocation(),
            stopDetail: this.stop.stopDetail,
            describe: this.stop.stopDetail.formatted_address,
            type: this.stop.type
          })
        } else if(this._getStopDetail().id === 'End'){
          this.props.mapView.setEndLocation({
            ...this.props.mapView.endLocation(),
            stopDetail: this.stop.stopDetail,
            describe: this.stop.stopDetail.formatted_address,
            type: this.stop.type
          })
        }
        
        this.props.mapView.reflashDirections().then(() => this.props.mapView.update())
        this.props.mapView._updateInitialLocation({
          latitude: this.stop.stopDetail.geometry.location.lat,
          longitude: this.stop.stopDetail.geometry.location.lng,
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

  updateStopDetail(stop) {
    this.stop = stop
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
