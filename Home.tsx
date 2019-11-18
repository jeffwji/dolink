import React from 'react'

import GLOBAL from './Global'

import {
    Alert              // 对话框
  } from 'react-native'

import {
  Container,
  Header,
  Content, 
  Button,
  Icon, 
  Text,
  Item,
  Input
} from 'native-base'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
        searchText: ''
    }
  }

  render() {
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name='ios-search' />
            <Input placeholder='Search' 
              onChangeText={ (text) => {
                this.setState({searchText: text})
                console.log('Input is: ' + this.state.searchText)
              } }/>
            <Button transparent
              onPress={ () =>
                Alert.alert('Search: ' + this.state.searchText, null, null)
              }
            >
              <Text>Search</Text>
            </Button>
          </Item>
        </Header>

        <Content>
          <Text>
            {GLOBAL.token}
          </Text>
        </Content>
      </Container>
    )
  }
}

