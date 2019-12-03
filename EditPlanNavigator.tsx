import React from 'react'

import {createStackNavigator} from 'react-navigation-stack'

import EditPlan from './EditPlan'
import Main from './Main'

/**
 * 定义攻略编辑界面的导航栈
 * 
 * 参考：https://medium.com/async-la/react-navigation-stacks-tabs-and-drawers-oh-my-92edd606e4db
 */
const EditPlanNavigator = createStackNavigator(
  {
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
    initialRouteName: 'EditPlan'
  }
)

export default EditPlanNavigator