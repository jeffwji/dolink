import React from 'react'

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

export default class Login extends React.Component {
  constructor(props) {
    super(props)
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
            <Input />
          </FormItem>
          <FormItem floatingLabel last>
            <Label>Password</Label>
            <Input secureTextEntry={true} />
          </FormItem>

          <Button full primary style={{ paddingBottom: 4 }}
            onPress={() => {
              if (navigate) {
                  navigate("Main")
                }
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
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0  // React Native 在 Android 上的绘图区域包括 System bar, 需要去除。
    },
  })
  