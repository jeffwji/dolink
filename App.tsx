import React from 'react'

import {
  Platform
} from 'react-native'

import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'

import { AppLoading } from 'expo'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'

import Main from './Main'   // 自适应到 main.android 或 main.ios 文件
import Login from './Login'
import SignUp from './SignUp'
import Chat from './Chat'
import Find from './Find'
import EditPlan from './EditPlan'
import GLOBAL from './Global'

/**
 * 定义缺省的导航栈
 */
const MainNavigator = createStackNavigator(
  {
    Main: {
      screen: Main,     // createStackNavigator 会将 `this`(MainNavigator) 作为 `navigation` 参数传递给 Main
      navigationOptions: {
        gesturesEnabled: false,    // 登录成功后不允许返回登陆界面(Android 无效，参见下面的 defaultGetStateForAction)
        title: "首页面",
        tabBarLabel: "Home page",
        header: null   //首页面去掉导航栏
      }
    },
    SignUp: {
      screen: SignUp,
      navigationOptions: (navigation) => ({
        title: "Sign up",
        tabBarLabel: "Sign Up"
      })
    },
    Login: {
      screen: Login,
      navigationOptions: (navigation) => ({
        title: "首页面",
        tabBarLabel: "Home page",
        header: null   //首页面去掉导航栏
      })
    },
    Chat: {
      screen: Chat,
      navigationOptions: (navigation) => ({
        title: "Chat",
        tabBarLabel: "Chat page",
        header: null
      })
    },
    Find: {
      screen: Find,
      navigationOptions: (navigation) => ({
        title: "Find",
        tabBarLabel: "Find page",
        header: null
      })
    },
    EditPlan: {
      screen: EditPlan,
      navigationOptions: (navigation) => ({
        title: "New",
        tabBarLabel: "Add new paln",
        header: null
      })
    }
  },
  {
    initialRouteName: GLOBAL.token==''?"Login":"Main"
  }
)

/**
 * 通过 createAppContainer 来构建绑定了 Navigator (this.prop.navigation) 的 App:NavigationContainer 实例。
 */
const AppWithNavigator = createAppContainer(MainNavigator)

// 禁止 Android 的硬件回退功能（登录成功后不允许返回登陆界面）
const defaultGetStateForAction = AppWithNavigator.router.getStateForAction

AppWithNavigator.router.getStateForAction = (action, state) => {
  if (Platform.OS === "android") {
    // Do not allow to go back from Home
    if (action.type === 'Navigation/BACK' && state 
          && (state.routes[state.index].routeName === 'Home' || state.routes[state.index].routeName === 'Login')
        ) {
      return null;
    }

    // Do not allow to go back to Login
    /*if (action.type === 'Navigation/BACK' && state) {
      const newRoutes = state.routes.filter(r => r.routeName !== 'Login');
      const newIndex = newRoutes.length - 1;
      return defaultGetStateForAction(action, { index: newIndex, routes: newRoutes });
    }*/
  }

  return defaultGetStateForAction(action, state);
}

/**
 *  继承 AppWithNavigator, 添加 componentDidMount 函数载入字体
 */
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
    })
    
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
