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
  Text,
} from 'native-base'

import {
  Platform,
  StatusBar,
  StyleSheet,
  Alert,
  View
} from 'react-native'

export default class EditPlan extends React.Component {
  constructor(props) {
    super(props)
  }

  state = {
      modified: false,
      title: ''
  }

  //////////////////////////////////////////
  startLocation = {
    describe: 'Current location',
    stopDetail: null,
    type: 'CURRENT_LOCATION',
    privacy: true
  }
  getStartLocation = () => {return this.startLocation}
  setStartLocation = (location) => {
    this.startLocation = location
    this.forceUpdate()
  }

  endLocation = {
    describe: 'Current location',
    stopDetail: null,
    type: 'CURRENT_LOCATION',
    privacy: true
  }
  getEndLocation = () => {return this.endLocation}
  setEndLocation = (location) => {
    this.startLocation = location
    this.forceUpdate()
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
              } }/>
            <View style={{flexDirection: 'row'}}><Text>Start from: </Text><Text>{this.getStartLocation().describe}</Text></View>
            <Button 
              style={styles.addButton} 
              active
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
            >
              <Icon active name="add" style={{color:'darkgrey'}}/>
            </Button>
            <View style={{flexDirection: 'row'}}><Text>End with: </Text><Text>{this.getEndLocation().describe}</Text></View>
          </Form>
        </Content>
      </Container>
    )
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
    marginLeft: 10,
  },

  addButton: {
    height: 60,
    width: 100,
    borderRadius:5,
    bottom: 10,
    borderWidth:1,
    borderColor:'lightgrey',
    backgroundColor:'#f5f5f5',
    justifyContent: 'center'
  }
})
