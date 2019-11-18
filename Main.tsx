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

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedTab: 'Home'
    };
  }

  render() {
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
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0  // React Native 在 Android 上的绘图区域包括 System bar, 需要去除。
  },
})

