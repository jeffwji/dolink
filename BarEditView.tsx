import React from 'react'

import {
    View,
    Text
  } from 'react-native'

export default class BarEditView extends React.Component {
    constructor(props) {
      super(props)
  
      this.state = {
          reload: false
      }
    }
  
    render(){
      const params = this.props.parameters
      const detail = params.marker.props.detail
    return(
        <View>
            <Text>{detail.description || detail.formatted_address || detail.name}</Text>
        </View>)
    }
}