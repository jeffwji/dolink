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
  Text
} from 'native-base'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
            <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Header</Title>
          </Body>
          <Right />
        </Header>

        <Content>
          <Text>
            This is Person Section
          </Text>
        </Content>
      </Container>
    )
  }
}

