
import React from 'react'
import {Marker} from 'react-native-maps'
import StopMarkerPin from './StopMarkerPin'
import PropTypes from 'prop-types';

import  {googleMapService} from './Global'
import {
  Image
} from 'react-native'

class StopMarker extends React.Component {
  constructor(props) {
    super(props)
  }
  marker = null

  render() {
    const stop = this.props.stopDetail
    const coord = {latitude: stop.geometry.location.lat, longitude: stop.geometry.location.lng }

    return(
      <Marker
        coordinate={coord}
        ref = {marker => this.marker = marker}
        title = {stop.description || stop.formatted_address || stop.name}
        onPress={e => {
          this.props.editStop(this)
        }}
        onDragEnd={e => {
          const param = e.nativeEvent.coordinate.latitude + "," + e.nativeEvent.coordinate.longitude
          googleMapService("geocode", `latlng=${param}`)
            .then(detail => {
              let result = detail.results.find(result => result.types.find(type => type === 'point_of_interest'))
              result = result?result:detail.results.find(result => result.types.find(type => type === 'route'))
              return result?result:detail.results[0]
            })
            .then( newStopEssential => {
              this.props.onStopLocationChange(newStopEssential, this.props.orders)
            })
            .catch(e => {
              console.warn(e)
            });
        }}
        draggable
      >
      {
        (this.props.showDetail()) && <StopMarkerPin orders={this.props.orders} stopDetail={stop}/>
      }
      {
        (!this.props.showDetail()) && <Image source={require("./assets/LandMarker_64.png")} style={{width: 32, height: 32}} />
      }
      </Marker>
    )
  }
}

StopMarker.propTypes = {
  orders: PropTypes.array.isRequired,
  style: PropTypes.object,
}

StopMarker.defaultProps = {
  showDetail() {return true}
};

export default StopMarker
