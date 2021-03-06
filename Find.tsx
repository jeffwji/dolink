import React from 'react'

import {
  Container,
  Header,
  Title, 
  Content, 
  Button, 
  Left,
  Right,
  Body, 
  Icon, 
  Text,
} from 'native-base'

import {
  StyleSheet
} from 'react-native'

import 
  GLOBAL, 
  {
    BASE_URL,
    API, 
    query
  } from './Global'

export default class Find extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    const {navigate} = this.props.navigation

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
            <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Find</Title>
          </Body>
          <Right />
        </Header>

        <Content>
          <Text>Something is happening?</Text>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
})
