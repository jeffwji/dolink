import React from 'react'

import {
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native'

import { 
  Container,
  Footer, 
  FooterTab, 
  Button,
  Icon
} from 'native-base'

import Home from './Home'
import Person from './Person'
import Find from './Find'
import Chat from './Chat'

import 
  GLOBAL,
  {BASE_URL, API, query, askPermission}
  from './Global'

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    const didBlurSubscription = this.props.navigation.addListener(
      'didFocus', payload => {
        console.log('Main: didFocus')

        if (GLOBAL.token == ''){
          const {navigate} = this.props.navigation
          navigate("Login")
        } else if(this.state.selectedTab == 'Person') {
          this.setState({selectedTab: 'Home'})
        }
      }
    )
    
    this.state = {
      selectedTab: 'Home'
    };
  }

  _retrievelUserInfo() {
    return query(BASE_URL + API.userInfo, 'GET', GLOBAL.token)
  }

  async componentWillMount() {
    const {navigate} = this.props.navigation

    await askPermission('NOTIFICATIONS')

    this._retrievelUserInfo().then( resp => {
      const { data, status } = resp
      
      if(status === 200) {
        GLOBAL.userInfo = data.Result
      }
    }).catch( error => {
      navigate('Login')
    })
  }

  render() {
    const {navigate} = this.props.navigation

    return (
      <Container style={styles.container}>
        {this._renderContent() }
        
        <Footer>
          <FooterTab>
            <Button active={this.state.selectedTab === 'Home'}
              onPress={() => {
                this.setState({ selectedTab: 'Home'})
              }}>
              <Icon name='ios-home' />
            </Button>
            <Button active={this.state.selectedTab === 'Chat'}
              onPress={() => {
                this.setState({ selectedTab: 'Chat'})
              }}>
              <Icon name='chatboxes' />
            </Button>
            <Button 
              style={styles.addButton} 
              active
              onPress={() => {
                navigate('EditPlan')
              }}
            >
              <Icon active name="add" style={{color:'darkgrey'}}/>
            </Button>
            <Button active={this.state.selectedTab === 'Find'}
              onPress={() => {
                this.setState({ selectedTab: 'Find'})
              }}>
              <Icon name='ios-search' />
            </Button>
            <Button active={this.state.selectedTab==='Person'}
              onPress={() => {
                this.setState({selectedTab: 'Person'})
              }}>
                <Icon name='ios-person'/>
              </Button>
          </FooterTab>
        </Footer>
      </Container>
    )
  }

  _renderContent() {
    if(this.state.selectedTab === 'Home') {
      return (
          <Home navigation={this.props.navigation}/>
      )
    } else if(this.state.selectedTab === 'Person'){
      return (
          <Person navigation={this.props.navigation}/>
      )
    }else if(this.state.selectedTab === 'Chat'){
      return (
          <Chat navigation={this.props.navigation}/>
      )
    }else if(this.state.selectedTab === 'Find'){
      return (
          <Find navigation={this.props.navigation}/>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0  // React Native 在 Android 上的绘图区域包括 System bar, 需要去除。
  },

  addButton: {
    height:  Platform.OS === "android" ? 70:84,
    width: Platform.OS === "android" ? 70:84,
    borderRadius:Platform.OS === "android" ? 35:42,
    bottom: 8,
    borderWidth:1,
    borderColor:'lightgrey',
    backgroundColor:'#f5f5f5'
  }
})

