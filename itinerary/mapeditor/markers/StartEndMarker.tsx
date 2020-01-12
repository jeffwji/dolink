
import React from 'react'
import {Marker} from 'react-native-maps'

import  {googleMapService} from '../../../util/Global'

import {
    Image
} from 'react-native'

class StartEndMarkerPin extends React.Component{
    constructor(props) {
        super(props)
    }

    render() {
        if(this.props.type === 'Start') {
            return(
                <Image
                    source={require('../../../assets/flag_red_64.png')}
                    style={{ width: 32, height: 32 }}
                />
            )
        } else {
            return(
                <Image
                    source={require('../../../assets/flag_blue_64.png')}
                    style={{ width: 32, height: 32 }}
                />
            )
        }
    }
}

export default class StartEndMarker extends React.Component {
  constructor(props) {
    super(props)
  }

  marker = null

  render() {
    const stop = this.props.location.stopDetail
    const coord = {latitude: stop.geometry.location.lat, longitude: stop.geometry.location.lng }

    return(
      <Marker
        coordinate={coord}
        ref = {marker => this.marker = marker}
        title = {stop.description || stop.formatted_address || stop.name}
        onPress={e => {
          this.props.showDetail(this)
        }}
        onDragEnd={e => {
            console.log(e)
            /*const param = e.nativeEvent.coordinate.latitude + "," + e.nativeEvent.coordinate.longitude
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
                });*/
        }}
        draggable
      >
        <StartEndMarkerPin type={this.props.type} />
      </Marker>
    )
  }
}

