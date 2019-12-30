import React from 'react'
import {googleMapService, REACT_APP_GOOGLE_PLACES_API} from './Global'

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
          onPress={(data, details = null) => {
              this.props.notifyLocationChange(details)
          }}
          query={{
            key: REACT_APP_GOOGLE_PLACES_API,
            language: 'en'
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
          styles={googleSearchInput}
        />
      )
    }
}

export default MapSearchInput

const googleSearchInput = {
  container: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    width: '60%',
    marginBottom: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  textInputContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
    borderTopWidth: 0,
    borderBottomWidth:0,
    width: '100%',
    borderRadius: 0.2,
  },
  description: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'white',
    color: '#00152b',
    opacity: 0.9,
    //fontWeight: 'bold'
  },
  poweredContainer: {
    backgroundColor: '#fff',
  },
  textInput: {
    height: 33,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#00152b'
  },
  separator: {
    backgroundColor: 'white',
  },
  predefinedPlacesDescription: {
    color: '#1faadb'
  }
};