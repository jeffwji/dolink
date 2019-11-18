import React from 'react'

import base64 from 'react-native-base64'

import {
    StyleSheet,
    Platform,
    StatusBar
  } from 'react-native'

import {
  Container,
  Header,
  Body,
  Title,
  Form,
  Item as FormItem,
  Label,
  Input,
  Button,
  Text
} from 'native-base'

import GLOBAL, {BASE_URL, API} from './Global'

export default class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      password: ''
    }
  }

  render() {
    const {navigate} = this.props.navigation
    
    return (
      <Container style={styles.container}>
        <Header>
          <Body>
            <Title>Best App Ever!</Title>
          </Body>
        </Header>
        <Form>
          <FormItem floatingLabel>
            <Label>Email</Label>
            <Input autoCapitalize = 'none'
              onChangeText={ (text) => {
                this.setState({username: text.toLowerCase()})
            }}/>
          </FormItem>
          <FormItem floatingLabel last>
            <Label>Password</Label>
            <Input secureTextEntry={true}
              autoCapitalize = 'none'
              onChangeText={ (text) => {
                this.setState({password: text})
            }}/>
          </FormItem>

          <Button full primary style={{ paddingBottom: 4 }}
            onPress={() => {
              this._login(this.state.username, this.state.password)
            }}
          >
            <Text> Sign In </Text>
          </Button>

          <Button full light primary
            onPress={() => {
              if (navigate) {
                  navigate("Main")
                }
            }}
          >
            <Text> Sign Up </Text>
          </Button>
        </Form>
      </Container>
    )
  }

  _login = (username, password)=> {
    const {navigate} = this.props.navigation

    GLOBAL.isLogin = false

    fetch(BASE_URL + API.login, {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' +  base64.encode(this.state.username + ':' + this.state.password)
      }
    })
    .then( response => {
      const statusCode = response.status
      const text = response.text()
      return Promise.all([statusCode, text]).then(res => ({
        statusCode: res[0],
        text: res[1]
      }))
    })
    .then( data => {
      const { statusCode, text } = data
      if(statusCode == 200) {
        GLOBAL.isLogin = true
        GLOBAL.token = text
        navigate('Main')
      } else {
        throw "Fail to login"
      }
    })
    .catch( error => {
      alert(error)
   })
  }    
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0  // React Native 在 Android 上的绘图区域包括 System bar, 需要去除。
    },
  })
  