import React from 'react'

import {
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native'

import {
  Container,
  Item
} from 'native-base'

import PropTypes from 'prop-types';

export default class MapController extends React.Component {
  render() {
    return(
      <Container style={styles.mapStuffsControlBar}>
        <Item style={{flexDirection: 'row', alignItems:'center'}}>
          <TouchableOpacity
              onPress={() => {
                this.props.mapView._setShowMarkerDetail(this.props.mapView.state.showMarkerDetail===0?2:this.props.mapView.state.showMarkerDetail-1)
              }}>
            <Image 
              source={this._getShowMarkerDetailIcon()}
              style={{width: 32, height: 32, marginLeft: 10, marginRight: 10}} />
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                this.props.mapView._setFindFoodEntertainment()
                this.props.mapView.nearBySearch.updateFoodAndEntertainment()
              }}>
            <Image
              source={this._getFoodEntertainmentIcon()}
              style={{width: 32, height: 32, marginLeft: 10, marginRight: 10}}/>
          </TouchableOpacity>
        </Item>
      </Container>
    )
  }

  _getShowMarkerDetailIcon() {
    switch(this.props.mapView.state.showMarkerDetail) {
      case 0:
        return require("../../assets/showMarkerDetail_square_0.png")
      case 1:
        return require("../../assets/showMarkerDetail_square_1.png")
      case 2:
        return require("../../assets/showMarkerDetail_square_2.png")
    }
  }

  _getFoodEntertainmentIcon() {
    switch(this.props.mapView.find_food_entertainment){
      case false:
          return require("../../assets/bar_disabled.png")
      case true:
          return require("../../assets/bar_enabled.png")
    }
  }
}

MapController.propTypes = {
  mapView: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  mapStuffsControlBar: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    left: 0,
    bottom: 0,
    height: 50,
    alignItems: 'center'
  }
});
