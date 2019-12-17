
import React from 'react'
import {Marker} from 'react-native-maps'
import StopDetailCallout from './StopDetailCallout'
import StopMarkerPin from './StopMarkerPin'
import PropTypes from 'prop-types';

import  {googleMapService} from './Global'
import {View} from 'react-native'

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
          onDragEnd={e => {
            const param = e.nativeEvent.coordinate.latitude + "," + e.nativeEvent.coordinate.longitude
            googleMapService("geocode", `latlng=${param}`)
              .then(detail => {
                let result = detail.results.find(result => result.types.find(type => type === 'point_of_interest'))
                result = result?result:detail.results.find(result => result.types.find(type => type === 'route'))
                return result?result:detail.results[0]
              })
              .then( newStopDetail => {
                this.props.onStopLocationChange(newStopDetail, this.props.orders)
              })
              .catch(e => {
                console.warn(e)
              });
          }}
          draggable
        >
          <StopMarkerPin orders={this.props.orders} stopDetail={stop} />
  
          <StopDetailCallout
            orders = {this.props.orders}
            stopDetail = {stop}
            addRemoveOpt={(stop) => {
              this.props.addRemoveOpt(stop)
            }}
          />
        </Marker>
      )
    }

    _reflashCallout() {
      if(this.marker) {
        this.marker.hideCallout()
        this.marker.showCallout()
      }
    }

    componentDidUpdate() {
      this._reflashCallout()
    }
  }

  
  StopMarker.propTypes = {
    orders: PropTypes.array.isRequired,
    style: PropTypes.object,
  }

  export default StopMarker
