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

export default class SignUp extends React.Component {
  constructor(props) {
    super(props)
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
            <Title>Header</Title>
          </Body>
          <Right />
        </Header>

        <Content>
          <Button>
            <Text> Sign up!! </Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

