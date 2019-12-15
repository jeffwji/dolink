
import React from 'react'
import {REACT_APP_GOOGLE_PLACES_API} from './Global'

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

class MapSearchInput extends React.Component {
    constructor(props) {
      super(props)
    }
    
    render() {
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
            this.props.notifyLocationChange(details) //details.geometry.location)
          }}
          query={{
            key: REACT_APP_GOOGLE_PLACES_API,
            language: 'en'
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
          currentLocationLabel="Nearby"
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

  export default MapSearchInput
