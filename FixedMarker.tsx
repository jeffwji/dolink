import React from 'react'

import {Marker} from 'react-native-maps'

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
        </Marker>
      return(marker)
    }
  }
