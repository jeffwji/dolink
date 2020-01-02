import React from 'react'

import {googleMapService} from './Global'
import {getRadius} from './Location'
import FixedMarker from './FixedMarker'

/*import {Marker} from 'react-native-maps'

class FixedMarker extends React.Component{
  marker = null

  render() {
    const detail = this.props.detail
    const coord = {latitude: detail.geometry.location.lat, longitude: detail.geometry.location.lng }
    const marker=
      <Marker
        coordinate={coord}
        ref = {marker => this.marker = marker}
        title = {detail.description || detail.formatted_address || detail.name}
        onPress={e => {
          this.props.showDetail(this)
        }}
      >
      </Marker>
    return(marker)
  }
}*/

type State = {
  mapView: string;
};

export default class NearBySearch extends React.Component<State> {
  constructor(props) {
    super(props)
  }

  interestings = {
    food_entertainment: {
      bar: [],
      cafe: [],
      restaurant: [],
      night_club:[],
      meal_takeaway:[],
      meal_delivery:[],
      bakery:[],
      casino:[]
    },
    transit:{
      bus_station: [],
      subway_station:[],
      transit_station:[],
      train_station:[],
      airport:[],
      car_rental:[],
      light_rail_station:[]
    },
    money:{
      bank: [],
      atm:[]
    },
    road_assistance:{
      parking:[],
      gas_station:[]
    },
    hotal:{
      lodging: [],
    },
    shopping:{
      store:[],
      supermarket:[],
      shopping_mall:[],
      grocery_or_supermarket:[],
      clothing_store: [],
      convenience_store: []
    },
    tourist: {
      museum:[],
      zoo:[],
      university: [],
      tourist_attraction:[],
      park:[],
      campground:[],
      art_gallery:[],
      aquarium:[],
      amusement_park:[]
    }
  }

  getInterestings(name) {
    return this.interestings[name]
  }

  updateFoodAndEntertainment() {
    if(this.props.mapView.find_food_entertainment){
      this._updateInterestings('food_entertainment', 'bar', this.props.mapView.currentLocationCoordinates)
    }
  }

  _updateInterestings(category, name, location, page_token=null, page=0) {
    if(page===0)
      this.interestings[category][name]=[]
    
    const r = getRadius(location.longitudeDelta)
    const getDefaultRadius = this.props.mapView.getDefaultRadius()
    return googleMapService("place/nearbysearch", `location=${location.latitude},${location.longitude}&radius=${(r>getDefaultRadius?getDefaultRadius:r)/2}&type=${name}${page_token==null?'':('&pagetoken='+page_token)}`)
      .then(json => {
        //console.log(r, json.status, json.next_page_token)
        if(json.results.length > 0){
          json.results.map((result, index) => {
            const marker = this._newMarker(result, page*20+index)
            this.interestings[category][name].push(marker)
          })
          this.props.mapView.update()

          if(json.next_page_token){
            setTimeout(() => this._updateInterestings(category, name, location, json.next_page_token, page+1), 2000)
          }
        }
      })
      .catch(error => console.log(error))
  }

  _newMarker(detail, key=0, color='#F9AF77'){
    return <FixedMarker
      key = {key}
      detail={detail}
      color={color}
      showDetail = {(marker) => console.log(marker.props.detail)}
    />
  }
}
