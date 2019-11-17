import React from 'react'

import {
    StyleSheet,
    Platform,
    StatusBar
  } from 'react-native'

import {
  Container,
  Content, 
  Button,
  Text
} from 'native-base'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {navigate} = this.props.navigation
    
    return (
      <Container style={styles.container}>
        <Content>
          <Button
            onPress={() => {
                if (navigate) {
                    navigate("Main")
                  }
              }}
          >
            <Text>Sign In</Text>
          </Button>
          <Button>
            <Text>Sign Up</Text>
          </Button>
        </Content>
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
  