import React from 'react'
import MapView, {PROVIDER_GOOGLE } from 'react-native-maps'

import {
  Container,
  Icon,
  Item,
  Drawer
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


export default class GoogleMap extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      currentLocationCoordinates: null,
      locationCoordinates: null,
      locationInput: '',
      markers: []
    }
  }

  componentDidMount () {
    if(this.state.currentLocationCoordinates==null ) {
      this._getCurrentPosition(true)
    }
  }

  _getCurrentPosition(updateStateLocation=false) {
    return askPermission('LOCATION').then(permit => {
      if(permit) {
        this._getLocation(
          data => {
            this._updateCurrentLocation(data.coords.latitude, data.coords.longitude)
            if(updateStateLocation)
              this._updateStateLocation(data.coords.latitude, data.coords.longitude)
          },
          error => {
            console.log(error)
          }
        )
      }
      else throw 'No permission to obtain location'
    })
  }

  _getLocation(resolve, handleError) {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position), 
      error => handleError(error),
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 }
    )
  }

  // Update location by navigation
  _updateStateLocation(latitude, longitude) {
    this.setState({
      locationCoordinates: {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    })
  }

  _updateCurrentLocation(latitude, longitude) {
    this.setState({
      currentLocationCoordinates: {
        latitude: latitude,
        longitude: longitude,
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
            initialRegion={this.state.currentLocationCoordinates}
            region={this.state.locationCoordinates}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true} 
          >
            <MyMarkers markers={this.state.markers} />
          </MapView>

          <View style={styles.allNonMapThings}>
            <Item>
              <MapInput 
                notifyChange={(loc) => this._updateInput(loc)}
                defaultLocations={[
                  { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }}
                ]}
              />
            </Item>
          </View>
        </View>
      )
    }
  }

  _showMarkers() {
    return(
      this.state.markers.map((marker) => {
        <MapView.Marker coordinate={
          this.state.locationCoordinates
        } />
      })
    )
  }

  _updateInput = (loc) => {
    this._updateStateLocation(loc.lat, loc.lng)
    const marker = {latlng: {
      latitude: loc.lat,
      longitude: loc.lng
    } }

    this.setState({markers: [marker]})
  }

  render() {
    return (
      <Container style={styles.container}>
        {this._showMap()}
      </Container>
    )
  }
}



class MyMarkers extends React.Component {
  render = () => {
    return (
        this.props.markers.map((marker, index) => 
          <MapView.Marker
            coordinate={marker.latlng}
            key={index}
          />
        )
    )
  }
}


class MapInput extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    // https://medium.com/@mohammad.nicoll/react-native-maps-with-autocomplete-e9c71e493974
    // https://github.com/FaridSafi/react-native-google-places-autocomplete

    // const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};

    return(
      <GooglePlacesAutocomplete
        placeholder='Enter Location'
        minLength={2}
        autoFocus={true}
        returnKeyType={'search'}
        listViewDisplayed='false'
        fetchDetails={true}
        renderDescription={row => row.description || row.formatted_address || row.name}
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
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
        predefinedPlaces={this.props.defaultLocations}
        nearbyPlacesAPI="GooglePlacesSearch"   // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={{
          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
          //key: '',
          //language: 'en',
        }}
        GooglePlacesSearchQuery={{
          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
          rankby: 'distance'
        }}
        GooglePlacesDetailsQuery={{
          // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
          // fields: 'formatted_address',
        }}
        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
        getDefaultValue={() => ''}
        enablePoweredByContainer={false}
        debounce={200}
      />
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

