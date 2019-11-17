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
        <Content>
          <Button>
            Sign In
          </Button>
          <Button>
            Sign Up
          </Button>
        </Content>
      </Container>
    )
  }
}

