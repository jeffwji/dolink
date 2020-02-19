import React from 'react'

import {
  Container,
  Header,
  Form, 
  Content,
  Input,
  Button, 
  Left,
  Right,
  Icon, 
  ListItem
} from 'native-base'

import {
  Platform,
  StatusBar,
  StyleSheet,
  Alert,
  View,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native'

import PropTypes from 'prop-types'
import DraggableFlatList from 'react-native-draggable-flatlist'

import {askPermission, googleMapService, getLocation, saveItinerary, updateItinerary, saveTravelPlan, updateTravelPlan, token} from '../util/Global'
import {coordinate2string, generateFlightRoute} from '../util/Location'
import DaytimePicker from '../util/DaytimePicker'

let planDetailViewHight = Dimensions.get('window').height*0.1

class EditFloatButton extends React.Component {
  constructor(props) {
    super(props)
  }

  state = {
    selected: -1
  }

  render(){
    return(
      <Button style={[styles.addButton, this.props.style]} 
        active
        onPress={this.props.onPress}
      >
        <Icon active name="add" style={{color:'darkgrey'}}/>
      </Button>
    )
  }
}

EditFloatButton.propTypes = {
  style: PropTypes.object
}


export default class EditPlan extends React.Component {
  constructor(props) {
    super(props)

    const didBlurSubscription = this.props.navigation.addListener(
      'didFocus', payload => {
         this.forceUpdate()
      }
    )
  }

  state = {
      modified: false,
  }

  currentLocation = null
  getCurrentLocation = () => {return this.currentLocation}
  setCurrentLocation = (location) => {
    this.currentLocation = location
  }

  //////////////////////////////////////////
  planId = null
  planHash = null
  plan = {
    title: '',
    itinerary: null,
    startLocation: {
      order: 'Start',
      describe: 'Current location',
      stopDetail: null,
      type: 'CURRENT_LOCATION',
      privacy: true
    },
    endLocation: {
      order: 'End',
      describe: 'Same to start location',
      stopDetail: null,
      type: 'CURRENT_LOCATION', // 'SAME_TO_START',
      privacy: true
    }
  }

  //////////////////////////////////////////
  getStartLocation = () => {return this.plan.startLocation}
  setStartLocation = (location) => {
    this.plan.startLocation = location
  }

  getEndLocation = () => {return this.plan.endLocation}
  setEndLocation = (location) => {
    this.plan.endLocation = location
  }

  //////////////////////////////////////////
  hash = null
  itineraryId = null
  stops=[]

  getStops() {
    return this.stops
  }

  setStops(stops){
    this.stops = stops
  }

  updateStops(update: (stops) => any) {
    update(this.stops)
  }
  
  directions = []

  getDirections() {
    return this.directions
  }

  setDirections(directions){
    this.directions = directions
  }

  updateDirections(update: (directions) => any) {
    update(this.directions)
  }

  async save(){
    this._saveItinerary()
      .then(itineraryId => {
         return this._savePlan(itineraryId)
      })
      .then(planHash => this.planHash=planHash)
  }

  async _saveItinerary() {
    if(this.stops.length > 0){
      const json = JSON.stringify(this.stops)
      const _hash:String = json.toString().hashCode()
      if(this.hash != _hash){
        if(this.itineraryId != null) {
          return updateItinerary({
            "itinerary": this.stops,
            "id": this.itineraryId
          }, token)
            .then(json => {
              if(json.data.Result._id != null) {
                this.hash = _hash
              }
              return this.itineraryId
            })
        } else {
          return saveItinerary({
            "itinerary": this.stops
          }, token)
            .then(json => {
              if(json.data.Result._id != null) {
                this.itineraryId = json.data.Result._id
                this.hash = _hash
              }
              return this.itineraryId
            })
        }
      } else {
        return null
      }
    } else {
      return null
    }
  }

  async _savePlan(itineraryId) {
    if(itineraryId == null) {
      console.log("No itinerary")
      return
    }

    this.plan.itinerary=itineraryId

    const json = JSON.stringify(this.plan)
    const _planHash:String = json.toString().hashCode()
    if(this.planHash != _planHash) {
      if(this.planId == null)
        return saveTravelPlan({
          "hash": ""+_planHash,
          "plan": this.plan,
        }, token)
          .then(json => {
            if(json.data.Result._id != null) {
              this.planId=json.data.Result._id
              this.planHash = _planHash
            }
            return this.planHash
          })
      else
        return updateTravelPlan({
          "_id": this.planId,
          "hash": ""+_planHash,
          "plan": this.plan,
        }, token)
          .then(json => {
            if(json.data.Result._id != null) {
              this.planHash = _planHash
            }
            return this.planHash
          })
    }
  }

  render() {
    this.save()
    const {navigate, goBack} = this.props.navigation

    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Button transparent onPress={() => {
              if (this.state.modified) {
                Alert.alert(
                  'Warning',
                  'Content is changed, are you sure you want go back?',
                  [
                    {text: 'Save and go back', onPress: () => {
                      console.log('Save and go back')
                      // null 参数表示无条件跳回之前的页面（主导航栈）, 否则 goBack 将缺省以本页面做为参考点，尝试跳往（当前导航栈的）前一页面，而不是跳回主导航栈。
                      // 参考：https://stackoverflow.com/questions/45489343/react-navigation-back-and-goback-not-working
                      goBack(null)
                    }},
                    {text: 'Go back without save', onPress: () => {
                      console.log('Go back without save')
                      goBack(null)
                    }},
                    { text: 'Cancel', style: 'Cancel', onPress: () => {
                      console.log('Cancel Pressed')
                    }},
                  ],
                  {cancelable: false},
                );
              } else {
                goBack(null)
              }
            }}>
              <Icon name='ios-arrow-back' />
            </Button>
          </Left>
          <Right>
            <Button transparent onPress={() =>{
              this.save()
            }}>
              <Text>Save</Text>
            </Button>
          </Right>
        </Header>

        <View style={styles.planDetail}>
          <Input placeholder='Title' 
            onChangeText={ (text) => this.plan.title = text }
          />
        </View>
        {this.showItinerary()}

        <EditFloatButton
          onPress={() => {
            navigate('PlanMap', {
              startLocation: () => this.getStartLocation(),
              setStartLocation: (location) => this.setStartLocation(location),
              endLocation: () => this.getEndLocation(),
              setEndLocation: (location) => this.setEndLocation(location),
              stops: () => this.getStops(),
              setStops: (stops) => this.setStops(stops),
              updateStops: (update) => this.updateStops(update),
              directions: () => this.getDirections(),
              setDirections: (directions) => this.setDirections(directions),
              updateDirections: (update) => this.updateDirections(update),
              isEndSameToStart: () => this.isEndSameToStart(),
              getDirection: (origin, dest) => this.getDirection(origin, dest),
              reflashDirections: () => this.reflashDirections(),
              currentLocation: () => this.getCurrentLocation(),
              setCurrentLocation: (location) => this.setCurrentLocation(location)
            })
          }}
        />
      </Container>
    )
  }

  showItinerary() {
    let items = this.stops.map((stop, index) => ({
      order: index,
      stop: stop,
      backgroundColor: `${index%2===0?'#F0DDF7':'#C4D2F7'}`
    }))

    items.unshift({order: 'Start'})
    items.push({ order: 'End' })

    return(
      <DraggableFlatList
        style={styles.planItinerary}
          data={items}
          renderItem={this._renderItineraryItem}
          keyExtractor={(item, index) => `stop-order-${index}`}
          onDragEnd={({ data, from, to }) => {
            if(to === 0 || to === data.length-1) {
              return
            }
            else {
              this.setStops(data.slice(1, data.length-1).map(item => item.stop))
              this.setState({
                selected: to-1
              })
              this.reflashDirections().then(() => this.forceUpdate())
            }
          }}
        />
    )
  }

  _renderItineraryItem = ({item, index, drag, isActive}) => {
    if(item.order==='Start'){
      return(
        <ListItem>
          <View style={{flex:1, flexDirection: 'column', marginTop: 3}}>
            <View style={{flex:1, flexDirection: 'row'}}>
              <Text>Start: </Text>
              <Text>{(this.getStartLocation().type==='CURRENT_LOCATION')?'Current location':this.getStartLocation().describe}</Text>
            </View>
          </View>
        </ListItem>
      )
    }
    else if(item.order==='End'){
      return(
        <ListItem>
          <View style={{flex:1, flexDirection: 'column', marginTop: 3}}>
            {this._getEndRoute()}
            <View style={{flex:1, flexDirection: 'row'}}>
              <Text>End: </Text>
              <Text>{this.isEndSameToStart()
                ?'Same to start'
                :(this.getEndLocation().type==='CURRENT_LOCATION'?'Current location':this.getEndLocation().describe)
              }</Text>
              {
                (!this.isEndSameToStart()) && <TouchableOpacity onPress={() => {
                    this.plan.endLocation.type = 'SAME_TO_START'
                    this.forceUpdate()
                    this.reflashDirections().then(() => this.forceUpdate())
                }}>
                  <Text style={{color: 'blue', textDecorationLine:'underline', left: 5}}>(Set to start)</Text>
                </TouchableOpacity>
              }
            </View>
          </View>
        </ListItem>
      )
    } else {
      const title = item.stop.stopDetail.name || item.stop.stopDetail.formatted_address || item.stop.stopDetail.description
      return (
        <ListItem
          key={''+item.order}
          style={{
            flex: 1,
            backgroundColor: isActive ? 'rgba(153,153,255, 1)' : item.backgroundColor,
            alignItems: 'flex-start', 
            justifyContent: 'center' 
          }}
          onLongPress={drag}
          onPress={e => this.setState({
            selected: item.order
          })}
        >
          <View style={{flex:1, flexDirection: 'column'}}>
            {this._getRoute(d => {
              return (d.destStopIndex===item.order && d.destination === item.stop.stopDetail.place_id)
              }, item.stop)}
            <View style={{flex:1, flexDirection: 'row'}}>
                <View style={{flex:8}} onPress={e => alert("Stop information")}>
                  <Text>Stop {item.order+1}: </Text>
                  <Text style={styles.text}>{title}</Text>
                  <DaytimePicker
                    daytime = {this.stops[item.order].duration}
                    updateNotify={(daytime) => {
                      this.updateStops(stops => stops[item.order].duration = daytime)
                      this.forceUpdate()
                    }}
                  />
                  {(item.order===this.state.selected) && 
                    <View>
                      <TouchableOpacity style={{flex:1}} onPress={e => alert("Show me!")}>
                        <Text>Click me!</Text>
                      </TouchableOpacity>
                    </View>
                  }
                </View>
                <TouchableOpacity style={{flex:1}} onPress={e => alert("navigate to galary")}>
                  <Icon name='camera'/>
                </TouchableOpacity>
            </View>
          </View>
        </ListItem>
      )
    }
  }

  async reflashDirections() {
    const directions = []

    const temp_stops = this.stops.map((stop, index) => {
      return {
        stop:stop,
        index:index
      }
    })

    let dest = null
    let origin = { stop: this._getStartLocationDetail(), index:'Start' }  //temp_stops.shift()

    if(temp_stops.length > 0) {
      do{
        dest = temp_stops.shift()
        await this.getDirection(origin, dest)
          .then(direction => {
            if(direction != null)
            directions.push(direction)
          })
        origin = dest
      }while(temp_stops.length > 0)
    }

    dest = {
      stop: this._getEndLocationDetail(),
      index:'End'
    }
    await this.getDirection(origin, dest)
      .then(direction => {
        if(direction != null)
        directions.push(direction)
      })
  
    this.directions = directions
  }

  getExistingDirection(origin, dest) {
    const dir =  this.directions.find(d => {
      const tansit_mode = this.getTransitMode(dest.stop)
      if( (tansit_mode===d.transit_mode) && (d.origin===origin.stop.stopDetail.place_id) && (d.destination===dest.stop.stopDetail.place_id) )
        return true
      else
        return false
    })
    return dir
  }

  getTransitMode(stop){
    return (typeof stop.transit_mode === 'undefined')?'driving':stop.transit_mode
  }

  async getDirection(origin, dest) {
    if(origin.stop.stopDetail.place_id != dest.stop.stopDetail.place_id){
      const dir = this.getExistingDirection(origin, dest)

      if(typeof dir !== 'undefined' && dir !== null) {
        const _dir = {
          route:dir.route, 
          destination: dir.destination,
          origin: dir.origin, 
          originStopIndex: origin.index,
          destStopIndex: dest.index,
          routeable: dir.routeable,
          privacy: dir.privacy,
          transit_mode: dir.transit_mode
        }

        return Promise.resolve(_dir)
      }

      const mode = this.getTransitMode(dest.stop)
      
      switch(mode){
        case 'flight':
          const direction = generateFlightRoute(origin, dest)
          return Promise.resolve(direction)
        default:
          const param = `origin=${coordinate2string(origin.stop.stopDetail.geometry.location)}&destination=${coordinate2string(dest.stop.stopDetail.geometry.location)}&mode=${mode}`
          return googleMapService("directions", param)
            .then(resp => {
              if (resp.routes.length > 0) {
                const direction = {
                  route:resp.routes[0], 
                  destination: ((typeof dest.stop.stopDetail.place_id !== 'undefined')?dest.stop.stopDetail.place_id:dest.stop.id),  //destination: ((typeof dest.index !== 'undefined')?dest.index:dest.stop.id), 
                  origin: ((typeof origin.stop.stopDetail.place_id !== 'undefined')?origin.stop.stopDetail.place_id:origin.stop.id), //origin: ((typeof origin.index !== 'undefined')?origin.index:origin.stop.id), 
                  originStopIndex: origin.index,
                  destStopIndex: dest.index,
                  routeable: true,
                  privacy: (typeof origin.stop.privacy !== 'undefined' && origin.stop.privacy) || (typeof dest.stop.privacy !== 'undefined' && dest.stop.privacy),
                  transit_mode: mode
                }
                return direction
              } else {
                const direction = generateFlightRoute(origin, dest)
                return direction
              }
            })
            .catch(e => {
              console.warn(e)
              return null
            })
       }
    } else {
      return Promise.resolve(null)
    }
  }

  isEndSameToStart() {
    return ((this.getEndLocation().type==='SAME_TO_START')
    || (this.getEndLocation().type === 'CURRENT_LOCATION' && this.getStartLocation().type === 'CURRENT_LOCATION')
    || (this._getEndLocationDetail().stopDetail.place_id === this._getStartLocationDetail().stopDetail.place_id))
  }

  _getStartLocationDetail() {
    if(this.getStartLocation().type === 'CURRENT_LOCATION')
      return {
        ...this.plan.startLocation,
        stopDetail: this.currentLocation.stopDetail
      }
    else
      return this.getStartLocation()
  }

  _getEndLocationDetail() {
    if(this.getEndLocation().type === 'CURRENT_LOCATION')
      return {
        ...this.plan.endLocation,
        stopDetail: (this.currentLocation===null)?null:this.currentLocation.stopDetail
      }
    else if(this.getEndLocation().type === 'SAME_TO_START')
      return this._getStartLocationDetail()
    else
      return this.getEndLocation()
  }

  _getEndRoute() {
    return this._getRoute(d=>{
      const key = this._getEndLocationDetail().stopDetail.place_id
      return d.destination === key
    }, this._getEndLocationDetail())
  }

  _getRoute(condition: (object) => Boolean, stop) {
    const dir = this.directions.find(d => condition(d))
    if (typeof dir !== 'undefined'){
      if(typeof dir.route.legs === 'undefined' || dir.route.legs.length === 0){
        return(
          <View style={{flex:1, flexDirection: 'row', justifyContent: 'center'}}>
            <TouchableOpacity onPress={e => alert(dir.origin + '->' + dir.destination)}>
              <Text>Unable to get route</Text>
            </TouchableOpacity>
          </View>
        )
      } else {
        const leg = dir.route.legs[0]
        const distance = leg.distance.text
        const duration = leg.duration.text
        return(
          <View style={{flex:1, flexDirection: 'row', justifyContent: 'center', margin:5}}>
            <TouchableOpacity onPress={e => alert(dir.origin + '->' + dir.destination)}>
              <Text>{this.getTransitMode(stop)}</Text>
            </TouchableOpacity>
            <View><Text> - {distance}</Text></View>
            <View><Text> - {duration}</Text></View>
          </View>
        )
      }
    } else return(null)
  }
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },

  planDetail: {
    margin: 10,
    height: planDetailViewHight
  },

  planItinerary: {
    margin: 10,
    //height: Dimensions.get('window').height-defaultHight
  },


  text: {
    flex: 1,
    flexWrap: 'wrap'
  },

  addButton: {
    height: 70,
    width: 70,
    borderRadius:35,
    right: 10,
    bottom: 20,
    borderWidth:1,
    borderColor:'lightgrey',
    backgroundColor:'rgba(204, 204, 255, 0.5)',
    justifyContent: 'center',
    position: 'absolute'
  }
})
