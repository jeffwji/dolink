import React from 'react'

import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'

import { AppLoading } from 'expo'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'

import Main from './Main'   // 自适应到 main.android 或 main.ios 文件
import Login from './Login'

const MainNavigator = createStackNavigator(
  {
    Main: {
      screen: Main,     // createStackNavigator 会将 `this`(MainNavigator) 作为 `navigation` 参数传递给 Main
      navigationOptions: {
        title: "首页面",
        tabBarLabel: "Home page",
        header: null   //首页面去掉导航栏
      }
    },
    Login: {
      screen: Login,
      navigationOptions: {
        title: "首页面",
        tabBarLabel: "Home page",
        header: null   //首页面去掉导航栏
      }
    }
  },
  {
    initialRouteName: "Login"
  }
)

// 通过 createAppContainer 来构建绑定了 Navigator (this.prop.navigation) 的 App:NavigationContainer 实例。
const AppWithNavigator = createAppContainer(MainNavigator)

export default class App extends AppWithNavigator {
  constructor(props) {
    super(props)

    this.state = {
      isReady: false
    }
  }

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });
    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady) {
      return <AppLoading/>;
    }

    return (
      <AppWithNavigator/>
    )
  }
}
