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
  TextInput,
  Alert
} from 'react-native'

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import axios from 'axios'
import GLOBAL, {askPermission, query, REACT_APP_GOOGLE_MAPS_API, REACT_APP_GOOGLE_PLACES_API} from './Global'

// https://github.com/react-native-community/react-native-maps
// https://medium.com/@princessjanf/react-native-maps-with-direction-from-current-location-ab1a371732c2
// https://github.com/ginnyfahs/CatCallOutApp


class MapInput extends React.Component {
  render() {
    // https://medium.com/@mohammad.nicoll/react-native-maps-with-autocomplete-e9c71e493974
    // https://github.com/FaridSafi/react-native-google-places-autocomplete

    const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};

    return(
      <GooglePlacesAutocomplete
        placeholder='Enter Location'
        minLength={2}
        autoFocus={true}
        returnKeyType={'search'}
        listViewDisplayed='false'
        fetchDetails={true}
        renderDescription={(row) => row.description || row.vicinity}
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          console.log(data, details)
          this.props.notifyChange(details.geometry.location)
        }}
        query={{
          key: REACT_APP_GOOGLE_PLACES_API,
          language: 'en',
          types: 'geocode'
        }}
        styles={{
          textInputContainer: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderTopWidth: 0,
            borderBottomWidth:0,
            width: '100%'
          },
          textInput: {
            height: 38,
            color: '#5d5d5d',
            fontSize: 16
          },
          description: {
            fontWeight: 'bold'
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          }
        }}
        currentLocation={true}
        currentLocationLabel="Current location"
        predefinedPlaces={[homePlace]}
        nearbyPlacesAPI='GoogleReverseGeocoding'
        GoogleReverseGeocodingQuery={{
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
          key: '',
          language: 'en',
        }}
        getDefaultValue={() => ''}
      />
    )
  }
}


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
      this._getLocation().then(data => {
        this._updateStateLocation(data.coords)
      })
    }
  }

  _getLocation() {
    return new Promise(
      (resolve, handleError) => {
        navigator.geolocation.getCurrentPosition(
          position => resolve(position), 
          error => handleError(error),
          { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 }
        )
      }
    )
  }

  _updateStateLocation(location) {
    this.setState({
      locationCoordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    })
  }

  // Get location from Google map platform
  _updateLocationCoordinates(coordinate){
    this.setState({
      locationCoordinates: {
        latitude: coordinate.lat,
        longitude: coordinate.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    })
  }

  _showMap() {
    if(this.state.locationCoordinates!=null) {
      return(
        <View style={styles.overallViewContainer}>
          <MapView style={styles.container}
            provider={ PROVIDER_GOOGLE }
            region={this.state.locationCoordinates}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true} 
          >
            <MapView.Marker
              coordinate={
                this.state.locationCoordinates
              }
            />
          </MapView>

          <View style={styles.allNonMapThings}>
            <Item>
              <MapInput notifyChange={(loc) => this._updateLocationCoordinates(loc)} />
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
      width: '100%'
    }
  });
