import React from 'react'

import {
  View,
  Text
} from 'react-native'

import RNPickerSelect from 'react-native-picker-select'
import PropTypes from 'prop-types';

const modes = [
  { label: `Driving`, value: 'driving', key: 0, color: 'black' },
  { label: `Walking`, value: 'walking', key: 1, color: 'black' },
  { label: `Transit`, value: 'transit', key: 2, color: 'black' },
  { label: `Flight`, value: 'flight', key: 3, color: 'black' }
]

export default class RouteEditView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
        reload: false
    }
  }

  render(){
    if(this.props.mapView.selectedRoute!==null){
      const {route, destination, origin, routeable} = this.props.mapView.routes[this.props.mapView.selectedRoute].polyline.props.direction
      if(routeable) {
        const {duration, distance, start_address, end_address} = route.legs[0]
        return(
          <View>
            <Text>From: (Stop {origin+1}) {start_address}</Text>
            <Text>To: (Stop {destination+1}) {end_address}</Text>
            <Text>Distance: {distance.text}</Text>
            <Text>Duration: {duration.text}</Text>

            <Text>Transit by: </Text><RNPickerSelect
              value={this.props.mapView._getTransitMode(destination)}
              onValueChange={(v) => {
                this.props.mapView._setTransitMode(destination, v)
                this.setState({reload:!this.state.reload})
                this.props.mapView.reflashDirections()
              }}
              items={modes}
            />
          </View>
        )
      } else {
        const way_points = this.props.mapView.routes[this.props.mapView.selectedRoute].polyline.props.direction.way_points
        console.log(way_points)
        return(
          <View>
          </View>
        )
      }
    } else {
      return(
        <View>
        </View>
      )
    }
  }
}

RouteEditView.propTypes = {
  mapView: PropTypes.object.isRequired
}
  
