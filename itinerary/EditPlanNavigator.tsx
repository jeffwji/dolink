import React from 'react'

import {createStackNavigator} from 'react-navigation-stack'
import {createAppContainer} from 'react-navigation'

import EditPlan from './EditPlan'
import PlanMap from './mapeditor/GoogleMap'

import {TouchableHighlight, Text} from 'react-native'

const Left = ({ onPress }) => (
  <TouchableHighlight onPress={onPress}>
    <Text>Back</Text>
  </TouchableHighlight>
);

const EditPlanNavigator = createStackNavigator(
  {
    EditPlan: {
      screen: EditPlan,
      navigationOptions: (navigation) => ({
        title: "Plan",
        tabBarLabel: "Add new paln",
        header: null
      })
    },
    PlanMap: {
      screen: PlanMap,
      navigationOptions: (navigation) => ({
        title: "Map"
      })
    },
  },
  {
    initialRouteName: 'EditPlan'
  }
)


export default createAppContainer(EditPlanNavigator)