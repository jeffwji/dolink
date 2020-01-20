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
      const {route, destStopIndex, originStopIndex, routeable} = this.props.mapView.routes[this.props.mapView.selectedRoute].polyline.props.direction
      const {duration, distance, start_address, end_address} = route.legs[0]
      //if(this.props.mapView._getTransitModeByIndex(destStopIndex)!=='flight') {
        return(
          <View>
            <Text>From: (Stop {Number.isInteger(originStopIndex)?originStopIndex+1:originStopIndex}) {start_address}</Text>
            <Text>To: (Stop {Number.isInteger(destStopIndex)?destStopIndex+1:destStopIndex}) {end_address}</Text>
            <Text>Distance: {distance.text}</Text>
            <Text>Duration: {duration.text}</Text>

            <Text>Transit by: </Text><RNPickerSelect
              value={this.props.mapView._getTransitModeByIndex(destStopIndex)}
              onValueChange={(v) => {
                this.props.mapView._setTransitModeByIndex(destStopIndex, v)
                this.props.mapView.reflashDirections().then(() => this.props.mapView.update())
                this.forceUpdate()
              }}
              items={modes}
            />
          </View>
        )
      /*} else {
        return(
          <View>
          </View>
        )
      }*/
    } else {
      this.props.mapView.setShowEditorMode(null)
    }
  }
}

RouteEditView.propTypes = {
  mapView: PropTypes.object.isRequired
}
  
