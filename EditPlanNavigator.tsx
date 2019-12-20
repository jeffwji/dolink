import React from 'react'

import {createStackNavigator} from 'react-navigation-stack'
import {SceneInterpolatorProps} from 'react-navigation-stack/lib/typescript/types';
import {createAppContainer, NavigationScreenComponent} from 'react-navigation'
import {Animated, Easing} from 'react-native';

import EditPlan from './EditPlan'
import PlanMap from './GoogleMap'
import StopEditModal from './StopEditModal';

const EditPlanNavigator = createStackNavigator(
  {
    EditPlan: {
      screen: EditPlan,
      navigationOptions: (navigation) => ({
        title: "New",
        tabBarLabel: "Add new paln",
        header: null
      })
    },
    PlanMap: {
      screen: PlanMap,
      navigationOptions: (navigation) => ({
        title: "PlanMap"
      })
    },
  },
  {
    initialRouteName: 'EditPlan',
  }
)

export default createAppContainer(EditPlanNavigator)