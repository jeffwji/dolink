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
  Body, 
  Icon, 
  Text,
  Footer
} from 'native-base'

import {
  Platform,
  StatusBar,
  StyleSheet,
  Alert
} from 'react-native'

import 
  GLOBAL, 
  {
    BASE_URL,
    API, 
    query
  } from './Global'

export default class EditPlan extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      modified: false,
      title: ''
    }
  }

  componentDidMount () {
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
              <Icon name='Back' />
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
            <Button 
              style={styles.addButton} 
              active
              onPress={() => {
                navigate('PlanMap')
              }}
            >
            <Icon active name="add" style={{color:'darkgrey'}}/>
            </Button>
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
