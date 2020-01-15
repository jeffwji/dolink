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
} from 'react-native'

import PropTypes from 'prop-types'


class EditFloatButton extends React.Component {
  constructor(props) {
    super(props)
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

  //////////////////////////////////////////
  startLocation = {
    id: 'Start',
    describe: 'Current location',
    stopDetail: null,
    type: 'CURRENT_LOCATION',
    privacy: true
  }
  getStartLocation = () => {return this.startLocation}
  setStartLocation = (location) => {
    this.startLocation = location
    //this.forceUpdate()
  }

  endLocation = {
    id: 'End',
    describe: 'Same to start location',
    stopDetail: null,
    type: 'CURRENT_LOCATION', // 'SAME_TO_START',
    privacy: true
  }
  getEndLocation = () => {return this.endLocation}
  setEndLocation = (location) => {
    this.endLocation = location
    //this.forceUpdate()
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

  render() {
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
              Alert.alert(
                'Info',
                'Saved!',
                null)
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
                  <Text>{(
                    this.getEndLocation().type==='SAME_TO_START'
                    || this.getEndLocation().type === 'CURRENT_LOCATION' && this.getStartLocation().type === 'CURRENT_LOCATION'
                    || this.getEndLocation().stopDetail.place_id === this.getStartLocation().stopDetail.place_id
                    )?'Same to start'
                     :(this.getEndLocation().type==='CURRENT_LOCATION'?'Current location':this.getEndLocation().describe)
                  }</Text>
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
              updateDirections: (update) => this.updateDirections(update)
            })
          }}
        />
      </Container>
    )
  }

  showItinerary() {
    return this.getStops().map((stop, index) => {
      const detail = stop.stopDetail
      return(
        <ListItem key={''+index}>
          <View style={{flex:1, flexDirection: 'column'}}>
            {this._getRoute(d => d.destination === index, stop)}
            <View style={{flex:1, flexDirection: 'row'}}>
                <Text>Stop {index+1}: </Text>
                <Text style={styles.text}>{detail.description || detail.formatted_address || detail.name}</Text>
            </View>
          </View>
        </ListItem>
      )
    })
  }
  
  _getEndRoute() {
    return this._getRoute(d=>{
      const key = (
        this.getEndLocation().type==='SAME_TO_START'
        || this.getEndLocation().type === 'CURRENT_LOCATION' && this.getStartLocation().type === 'CURRENT_LOCATION'
        )?'Start':'End'
      return d.destination === key
    }, this.getEndLocation())
  }

  _getRoute(condition: (object) => Boolean, stop) {
    const dir = this.directions.find(d => condition(d))
    if (typeof dir !== 'undefined'){
      if(typeof dir.route.legs === 'undefined' || dir.route.legs.length === 0){
        return(
          <View style={{flex:1, flexDirection: 'row', justifyContent: 'center'}}>
            <View><Text>Unable to get route</Text></View>
          </View>
        )
      } else {
        const leg = dir.route.legs[0]
        const distance = leg.distance.text
        const duration = leg.duration.text
        return(
          <View style={{flex:1, flexDirection: 'row', justifyContent: 'center', margin:5}}>
            <View><Text>{(typeof stop.transit_mode === 'undefined')?'Driving':stop.transit_mode}</Text></View>
            <View><Text> - {distance}</Text></View>
            <View><Text> - {duration}</Text></View>
          </View>
        )
      }
    } else return(null)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },

  content: {
    flex: 1,
    //marginLeft: 10,
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
