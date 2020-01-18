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
  TouchableOpacity
} from 'react-native'

import PropTypes from 'prop-types'
import DraggableFlatList from 'react-native-draggable-flatlist'

import {askPermission, googleMapService, getLocation} from '../util/Global'
import {coordinate2string, generateFlightRoute} from '../util/Location'
// import { sha256 } from 'react-native-sha256'

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
      title: ''
  }

  hash = null

  //////////////////////////////////////////
  plan = {
    itinary: null,
    startLocation: {
      mark: 'Start',
      describe: 'Current location',
      stopDetail: null,
      type: 'CURRENT_LOCATION',
      privacy: true
    },
    endLocation: {
      mark: 'End',
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
    this._saveItinary().then(id => this._savePlan(id))
  }

  _savePlan(id) {
  }

  async _saveItinary() {
    if(this.stops.length > 0){
      const json = JSON.stringify(this.stops)
      const _hash = json.toString().hashCode()
      if(this.hash != _hash){
        console.log(_hash)
        const id = _hash
        this.hash = _hash
        return id
      } else {
        return null
      }
    } else {
      return null
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

        <Content style={styles.content}>
          <Form>
            <Input placeholder='Title' 
              onChangeText={ (text) => {
                this.setState({title: text})
              } }
            />
            <ListItem>
              <View style={{flex:1, flexDirection: 'column', marginTop: 3}}>
                <View style={{flex:1, flexDirection: 'row'}}>
                  <Text>Start: </Text>
                  <Text>{(this.getStartLocation().type==='CURRENT_LOCATION')?'Current location':this.getStartLocation().describe}</Text>
                </View>
              </View>
            </ListItem>

            {this.showItinerary()}

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
          </Form>
        </Content>

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
              reflashDirections: () => this.reflashDirections()
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

    return(
      <DraggableFlatList
          data={items}
          renderItem={this._renderItineraryItem}
          keyExtractor={(item, index) => `stop-order-${index}`}
          onDragEnd={({ data, from, to }) => {
            this.setStops(data.map(item => item.stop))
            this.setState({
              selected: to
            })
            this.reflashDirections().then(() => this.forceUpdate())
          }}
        />
    )
  }

  _renderItineraryItem = ({item, index, drag, isActive}) => {
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
            return d.destination === item.stop.stopDetail.place_id
            }, item.stop)}
          <View style={{flex:1, flexDirection: 'row'}}>
              <View style={{flex:8}} onPress={e => alert("Stop information")}>
                <Text>Stop {item.order+1}: </Text>
                <Text style={styles.text}>{title}</Text>
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

  async reflashDirections() {
    const directions = []

    const temp_stops = this.stops.map((stop, index) => {
      return {
        stop:stop,
        index:index
      }
    })

    let dest = null
    let origin = { stop: this.plan.startLocation }  //temp_stops.shift()

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

    const end = this.plan.endLocation
    if(end.type === 'SAME_TO_START' || ((end.type === this.plan.startLocation.type) && (end.type === 'CURRENT_LOCATION'))) {
      dest = { stop:this.plan.startLocation }  
    } else {
      dest = { stop:end }  
    }
    await this.getDirection(origin, dest)
      .then(direction => {
        if(direction != null)
        directions.push(direction)
      })
  
    this.directions = directions
  }

  getExistingDirection(origin, dest) {
    return this.directions.find(d => {
      if (( (d.origin===origin.stop.stopDetail.place_id) && (d.destination===dest.stop.stopDetail.place_id) )
          && (this.getTransitMode(d) === this.getTransitMode(dest)) ){
          return true
        }
      else {
        return false
      }
    })
  }

  getTransitMode(stop){
    return (typeof stop.transit_mode === 'undefined')?'driving':stop.transit_mode
  }

  async getDirection(origin, dest) {
    if(origin.stop.stopDetail.place_id != dest.stop.stopDetail.place_id){
      
      const f = this.getExistingDirection(origin, dest)
      if(typeof f !== 'undefined' && f !== null) {
        return Promise.resolve(f)
      }

      const mode = this.getTransitMode(dest)
      switch(mode){
        case 'flight':
          const direction = generateFlightRoute(origin, dest)
          return Promise.resolve(direction)
        default:
          return googleMapService("directions", `origin=${coordinate2string(origin.stop.stopDetail.geometry.location)}&destination=${coordinate2string(dest.stop.stopDetail.geometry.location)}&mode=${mode}`)
            .then(resp => {
              if (resp.routes.length > 0) {
                const direction = {
                  route:resp.routes[0], 
                  destination: ((typeof dest.stop.stopDetail.place_id !== 'undefined')?dest.stop.stopDetail.place_id:dest.stop.id),  //destination: ((typeof dest.index !== 'undefined')?dest.index:dest.stop.id), 
                  origin: ((typeof origin.stop.stopDetail.place_id !== 'undefined')?origin.stop.stopDetail.place_id:origin.stop.id), //origin: ((typeof origin.index !== 'undefined')?origin.index:origin.stop.id), 
                  routeable: true,
                  privacy: (typeof origin.stop.privacy !== 'undefined' && origin.stop.privacy) || (typeof dest.stop.privacy !== 'undefined' && dest.stop.privacy)
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
    return this.getEndLocation().type==='SAME_TO_START'
    || this.getEndLocation().type === 'CURRENT_LOCATION' && this.getStartLocation().type === 'CURRENT_LOCATION'
    || this.getEndLocation().stopDetail.place_id === this.getStartLocation().stopDetail.place_id
  }

  _getEndRoute() {
    return this._getRoute(d=>{
      const key = this.isEndSameToStart()?this.getStartLocation().stopDetail.place_id:this.getEndLocation().stopDetail.place_id
      return d.destination === key
    }, this.getEndLocation())
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

  content: {
    flex: 1,
    margin: 10,
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
