import React from 'react'

import {
  Image,
  Text,
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
        <Item>
          <TouchableOpacity
              onPress={() => {
                this.props.mapView.showMarkerDetail=this.props.mapView.showMarkerDetail===0?2:this.props.mapView.showMarkerDetail-1
                this.props.mapView.update()
              }}>
            <Image 
              source={this._getShowMarkerDetailIcon()}
              style={{width: 32, height: 32}} />
          </TouchableOpacity>
        </Item>
      </Container>
    )
  }

  _getShowMarkerDetailIcon() {
    switch(this.props.mapView.showMarkerDetail) {
      case 0:
        return require("./assets/showMarkerDetail_square_0.png")
      case 1:
        return require("./assets/showMarkerDetail_square_1.png")
      case 2:
        return require("./assets/showMarkerDetail_square_2.png")
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
