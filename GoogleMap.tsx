import React from 'react'
import MapView from 'react-native-maps'

import {
  Container,
  Icon
} from 'native-base'

import {
    View, 
    Dimensions,
    StyleSheet
} from 'react-native'

import GLOBAL, {askPermission, query} from './Global'

export default class GoogleMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      concat: null,
      coords:[],
      x: 'false',
      cordLatitude:-6.23,
      cordLongitude:106.75,
    }
  }

  componentDidMount () {
    if(this.state.latitude==null || this.state.longitude==null)
      this._getCurrentPosition()
  }

  async _getCurrentPosition() {
    // https://github.com/react-native-community/react-native-maps
    // https://medium.com/@princessjanf/react-native-maps-with-direction-from-current-location-ab1a371732c2
    if(await askPermission('LOCATION')) {
      navigator.geolocation.getCurrentPosition( 
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          })
        },
        (error) => this.setState({ error: error.message }),
        { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 }
      )
    }
  }

  _showMap() {
      if(this.state.latitude!=null && this.state.longitude!=null) {
          return(
            <MapView
              style={styles.mapStyle}
              initialRegion={
                {
                  latitude: this.state.latitude,
                  longitude: this.state.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421
                }
              }
            />
          )
      }
  }

  render() {
    return (
      <Container style={styles.container}>
        {this._showMap()}
      </Container>
    )
  }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mapStyle: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  });