import React from 'react'

import {googleMapService} from '../../util/Global'
import {getRadius} from '../../util/Location'
import FixedMarker from './FixedMarker'
import {View, Text } from 'react-native';

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
      this._updateInterestings(
        'food_entertainment', 
        'bar',
        this.props.mapView.initialLocationCoordinates,
        (result, index) => this._newFoodEntertainmentMarker(result, index)
      )
    }
  }

  _updateInterestings(category, name, location, markerGenerator, page_token=null, page=0) {
    if(page===0)
      this.interestings[category][name]=[]
    
    const r = getRadius(location.longitudeDelta)
    const getDefaultRadius = this.props.mapView.getDefaultRadius()
    return googleMapService("place/nearbysearch", `location=${location.latitude},${location.longitude}&radius=${(r>getDefaultRadius?getDefaultRadius:r)/2}&type=${name}${page_token==null?'':('&pagetoken='+page_token)}`)
      .then(json => {
        if(json.results.length > 0){
          json.results.map((result, index) => {
            const marker = markerGenerator(result, page*20+index) //this._newMarker(result, page*20+index)
            this.interestings[category][name].push(marker)
          })
          this.props.mapView.update()

          if(json.next_page_token){
            setTimeout(() => this._updateInterestings(category, name, location, markerGenerator, json.next_page_token, page+1), 2000)
          }
        }
      })
      .catch(error => console.log(error))
  }

  _newFoodEntertainmentMarker(detail, key=0, color='rgba(240, 218, 55, 0.8)'){
    return <FixedMarker
      key = {key}
      detail={detail}
      color={color}
      showDetail = {(marker) => {
        this.props.mapView.setShowEditorMode('Bar', {marker:marker})
        //console.log(marker.props.detail)
      }}
      onShow = {detail => {
        return(
          <View>
            <Text style={{color: 'hotpink'}}>{detail.description || detail.formatted_address || detail.name}</Text>
            {(detail.rating) && <Text style={{color: 'blue'}}>Rating: {detail.rating}</Text>}
          </View>
        ) 
      }}
    />
  }
}
