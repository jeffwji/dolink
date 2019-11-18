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
          <Button onPress={() => {
              if (navigate) {
                  navigate("Login")
                }
            }}>
            <Text> Logout </Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

