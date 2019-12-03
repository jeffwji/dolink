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
  Footer
} from 'native-base'

import {
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
      modified: true
    }
  }

  componentDidMount () {
  }

  render() {
    const {goBack} = this.props.navigation

    return (
      <Container>
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
                      goBack()
                    }},
                    {text: 'Go back without save', onPress: () => {
                      console.log('Go back without save')
                      goBack()
                    }},
                    { text: 'Cancel', style: 'Cancel', onPress: () => {
                      console.log('Cancel Pressed')
                    }},
                  ],
                  {cancelable: false},
                );
              } else {
                goBack()
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

        <Content>
          <Text>Add new plan</Text>
        </Content>

      </Container>
    )
  }
}

const styles = StyleSheet.create({
})
