import React from 'react'

import {
  View,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native'

import RouteEditView from './RouteEditView'
import MarkerEditView from './MarkerEditView'

type State = {
  defaultMapViewHight: number
};

export default class EditView extends React.Component<State> {
  constructor(props) {
    super(props)

    this.state = {
      reload: false,
      placeImageIndex: 0,
      defaultMapViewHight: Dimensions.get('window').height/1.5,
    }
  }

  HEIGHT = Dimensions.get('window').height

  render() {
    if(this.props.mapView.state.showEditor)
      return(
        <View style={[styles.overlay, { height: this.HEIGHT-this.state.defaultMapViewHight }]}>
          <View
            style={styles.slidingBar}
            onMoveShouldSetResponder={this._handleMoveShouldSetResponder}
            onResponderMove={this._handleResponderMove}
          />
          {this._renderContent()}
        </View>
      )
    else
    return(<View></View>)
  }

  _renderContent() {
    switch(this.props.mapView.state.showEditor){
      case 'Marker':
        return(
          this._renderMarkerEdit()
        )
      case 'Route':
        return(
          <RouteEditView mapView={this.props.mapView}/>
        )
      default:
        return(<View></View>)
    }
  }

  _handleMoveShouldSetResponder = (evt) => {
    return true;
  }

  _handleResponderMove =(evt) => {
    if(this.HEIGHT-evt.nativeEvent.pageY > 50)
      this.setState({
        defaultMapViewHight: Platform.OS === "android"?evt.nativeEvent.pageY-40:evt.nativeEvent.pageY
      })
    else {
      this.props.mapView._closeStopEditModal()
      this.setState({
        defaultMapViewHight: Dimensions.get('window').height/1.5
      })
    }
  }
  
  _renderMarkerEdit() {
    if(this.props.mapView.editingPlaceId || this.props.mapView.stopCandidate) {
      return(
        <MarkerEditView mapView={this.props.mapView} />
      )
    }
    
    this.props.mapView._closeStopEditModal()
    this.setState({
      defaultMapViewHight: Dimensions.get('window').height/1.5
    })
  }
}

const styles = StyleSheet.create({
  slidingBar: {
    height: 20, 
    width: Dimensions.get('window').width, 
    backgroundColor: 'black'
  },
  overlay: {
    //flex: 1,
    //position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
    width: Dimensions.get('window').width
  }
})

