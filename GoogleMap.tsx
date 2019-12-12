import React from 'react'
import MapView, {PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps'

import {
  Container,
  Icon,
  Item,
  Button,
  Drawer,
  Label
} from 'native-base'

import {
  View, 
  Dimensions,
  StyleSheet,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  TouchableHighlight
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
      currentMarker: null,
      stops: [],
    }
  }

  stopMarkers = []

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
          <View style={styles.allNonMapThings}>
            <Item>
              <MapInput 
                notifyLocationChange={(loc) => {
                  this._setCurrentMarker(loc)
                }}
                defaultLocations={[
                  { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }}
                ]}
              />
            </Item>
          </View>

          <MapView style={styles.container}
            provider={ PROVIDER_GOOGLE }
            initialRegion={this.state.currentLocationCoordinates}
            region={this.state.locationCoordinates}
            showsUserLocation={true}
            zoomEnabled={true} 
            scrollEnabled={true} 
          >
            {this._showMarkers()}
            {this._showCurrentMarker()}
          </MapView>
        </View>
      )
    }
  }

  _showCurrentMarker() {
    if(this.state.stop != null)
      return(
        <StopMarker
          stop={this.state.stop}
          color='#009688'
          addRemoveOpt = {i => this._addInterestedLocation(i)}
        />
      )
  }

  _showMarkers() {
    return(
      this.state.stops.map((stop, index) => {
        const i = this.stopMarkers.findIndex(marker => {
          const s = marker.props.stop.latlng
          return (s.latitude == stop.latlng.latitude) && (s.longitude == stop.latlng.longitude)
        })

        if (i < 0){
          const stopMarker =
            <StopMarker
              key={index}
              orders = {[index]}
              stop={stop}
              color='#f44336'
              addRemoveOpt = {i => this._removeInterestedLocation(i)}
            />
          this.stopMarkers.push(stopMarker)
          return stopMarker
        }
        else {
          const marker = this.stopMarkers.splice(i, 1)[0]
          if(marker.props.orders.findIndex(order => {
            return order == index
          }) > -1)
            return marker
          else {
            const orders = marker.props.orders.concat(index)
            const stopMarker = 
              <StopMarker
                key={index}
                orders = {orders}
                stop={stop}
                color='#f44336'
                addRemoveOpt = {i => this._removeInterestedLocation(i)}
              />
            this.stopMarkers.push(stopMarker)
            return stopMarker
          }
        }
      } )
    )
  }

  _setCurrentMarker = (loc) => {
    this._updateStateLocation(loc.lat, loc.lng)
    const stop = {
      latlng: {
        latitude: loc.lat,
        longitude: loc.lng
      },
      interested: false
    }
    this.setState({stop: stop})
  }

  _addInterestedLocation = (location) => {
    this._updateStateLocation(location.latitude, location.longitude)
    const stop = {
      latlng: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      interested: true
    }

    const stops = this.state.stops.concat(stop)
    this.setState({stops: stops})
    this.setState({stop: null})
  }

  _removeInterestedLocation = (index) => {
    const stopList = this.state.stops
    stopList.splice(index, 1)
    this.setState({
      stops: stopList
    })
  }

  render() {
    return (
      <Container style={styles.container}>
        {this._showMap()}
      </Container>
    )
  }
}

class StopMarker extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    return(
      <Marker
        coordinate={this.props.stop.latlng}
        pinColor={this.props.color}
      >
        <StopCallout
          orders = {this.props.orders}
          stop = {this.props.stop}
          addRemoveOpt={(i) => {
            this.props.addRemoveOpt(i)
          }} 
        />
      </Marker>
    )
  }
}

class StopCallout extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    if (!this.props.stop.interested) {
      return(
        <Callout
          style={{width:220, height:100}}
          onPress={() => {
            this.props.addRemoveOpt(this.props.stop.latlng)
          }}
        >
            <Text>Add it to route</Text>
            <Button>
              <Label>Add</Label>
            </Button>
        </Callout>
      )
    }
    else {
      return(
        <Callout
          style={{width:220, height:300}}
          onPress={() => {
            this.props.orders.map( (order, index) => {
              this.props.addRemoveOpt(order)
            })
          }}
        >
          {this.props.orders.map( (order, index) => this._renderStops(order) )}
        </Callout>
      )
    }
  }

  _renderStops(index) {
    return(
        <View key={index}>
          <Text>Remove #{index} it to route</Text>
          <Button>
            <Label>Remove #{index}</Label>
          </Button>
        </View>
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
        // minLength={2}
        autoFocus={true}
        returnKeyType={'search'}
        listViewDisplayed='false'
        fetchDetails={true}
        renderDescription={row => row.description || row.formatted_address || row.name}
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          this.props.notifyLocationChange(details.geometry.location)
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  container: {
    // position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  allNonMapThings: {
    alignItems: 'center',
    width: '100%'
  },
  callout: {

  }
});

