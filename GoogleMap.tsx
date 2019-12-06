import React from 'react'
import MapView, {PROVIDER_GOOGLE } from 'react-native-maps'

import {
  Container,
  Icon,
  Item
} from 'native-base'

import {
  View, 
  Dimensions,
  StyleSheet,
  TextInput
} from 'react-native'

import axios from 'axios'
import GLOBAL, {askPermission, query, REACT_APP_GOOGLE_MAPS_API, REACT_APP_GOOGLE_PLACES_API} from './Global'

// https://github.com/react-native-community/react-native-maps
// https://medium.com/@princessjanf/react-native-maps-with-direction-from-current-location-ab1a371732c2
// https://github.com/ginnyfahs/CatCallOutApp

export default class GoogleMap extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      locationCoordinates: null,
      locationInput: ''
    }
  }

  componentDidMount () {
    if(this.state.locationCoordinates==null)
      this._getCurrentPosition()
  }

  async _getCurrentPosition() {
    if(await askPermission('LOCATION')) {
      navigator.geolocation.getCurrentPosition( 
        position => {
          this.setState({
            locationCoordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }
          })
        },
        (error) => console.log(error.message),
        { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 }
      )
    }
  }

  _submit = (input) => {
    // axios.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + this.state.locationInput.split(' ').join('') + "&key=" + REACT_APP_GOOGLE_PLACES_API)
    // .then(response => this._updateLocationCoordinates(response))
    // .catch(error => console.log("Failjax: ", error))
    console.log("Input text: " + input.nativeEvent.text)
  }

  _updateLocationCoordinates(response){
    const coordinate = response.data.results[0].geometry.location 
    this.setState({
      locationCoordinates: {
        latitude: coordinate.lat,
        longitude: coordinate.lng
      }
    })
  }

  _showMap() {
    if(this.state.locationCoordinates!=null) {
      return(
        <View style={styles.overallViewContainer}>
          <MapView style={styles.container}
            provider={ PROVIDER_GOOGLE }
            initialRegion={this.state.locationCoordinates}
            zoomEnabled={true} 
            scrollEnabled={true} 
          >
            <MapView.Marker 
              coordinate={{
                latitude: this.state.locationCoordinates.latitude,
                longitude: this.state.locationCoordinates.longitude
              }}
            />
          </MapView>

          <View style={styles.allNonMapThings}>
            <Item style={styles.inputContainer}>
              <TextInput style={ styles.input }
                placeholder="Where to go?"
                value={this.state.locationInput}
                onChangeText={text => this.setState({ locationInput: text })}
                onSubmitEditing={this._submit}
              />
            </Item>
          </View>
        </View>
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
    overallViewContainer: {
      position: 'absolute',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
    container: {
      position: 'absolute',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    allNonMapThings: {
      alignItems: 'center',
      height: '100%',
      width: '100%'
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      width: '90%',
      height: '6%',
      top: 30,
      borderRadius: 5,
      shadowOpacity: 0.75,
      shadowRadius: 1,
      shadowColor: 'gray',
      shadowOffset: { height: 0, width: 0}
    },
    input: {
      width: '88%',
      marginTop: 'auto',
      marginBottom: 'auto',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  });
