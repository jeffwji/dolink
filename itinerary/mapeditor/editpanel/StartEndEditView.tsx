import React from 'react'

import {
  Button,
  Item
} from 'native-base'

import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet
} from 'react-native'

import {googleImageService} from '../../../util/Global'
import ChangeStartEndModal from './stopeditor/ChangeStartEndModal'

export default class StartEndEditView extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        changeStopModal: null,
        placeImageIndex: 0
    }
  
    render(){
        const params = this.props.parameters
        const detail = params.marker.props.location.stopDetail
        
        return(
        <View>
            {this._renderMarkerInformation(detail)}
            {this._renderChangeStopMode()}
        </View>
        )
    }

  _renderMarkerInformation(detail) {
    return(
      <View style={{
        flexDirection: 'row'
      }}>
        {this._renderPicture(detail)}
        {this._renderAddress(detail)}
      </View>
    )
  }

  _renderPicture(detail) {
    const photos = detail.photos
    if(photos && photos.length > 0) {
      const photo = photos[this.state.placeImageIndex]
      const uri=googleImageService(photo.photo_reference, Dimensions.get('window').width/2)
      return(
        <Image
          source={{ uri: uri} }
          style={styles.scrollableModalImage}
        />
      )
    }
    else {
      return(
        <Image
          source={require('../../../assets/LandMarker_128-256.png')}
          style={styles.scrollableModalImage}
        />
      )
    }
  }

  _renderAddress(detail){
    return(
      <View style={{
        flex: 1,
        flexDirection: 'column'
      }}>
        <Item>
          {(detail.icon) && 
            <Image
              source={{ uri: detail.icon} }
              style={{ width: 16, height: 16 }}
            />
          }
          {(detail.name) && <Text style={styles.scrollableModalText}>{detail.name}</Text>}
        </Item>
        {(detail.formatted_address) && <Text style={styles.scrollableModalText}>{detail.formatted_address}</Text>}
        {(detail.formatted_phone_number) && <Text style={styles.scrollableModalText}>{detail.formatted_phone_number}</Text>}
        {(detail.rating) && <Text style={styles.scrollableModalText}>Rating: {detail.rating}</Text>}
        <Button
          onPress={() => {
            this._changeLocation()
          }}
        >
          <Text style={[styles.scrollableModalText, {alignItems: 'center'}]}>Change location</Text>
        </Button>
      </View>
    )
  }

  _changeLocation() {
    this.setState({
        changeStopModal: this._createChangeStopModal('CHANGE_LOCATION')
      })
  }

  _createChangeStopModal(mode, parameters=null) {
    const modal = <ChangeStartEndModal
      mode={mode}
      mapView = {this.props.mapView}
      location = {this.props.parameters.marker.props.location}
      close={() => this._closeChangeStopModal()}
      confirm={() => console.log('Confirm change') }
      parameters={parameters}
    />
    return modal
  }
  
  _closeChangeStopModal(){
    this.setState({
      changeStopModal: null
    })
  }

  _renderChangeStopMode() {
    if (this.state.changeStopModal !== null){
      return this.state.changeStopModal
    } else
      return null
  }
}

const styles = StyleSheet.create({
  stopEditor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollableModalText: {
    flex: 1,
    fontSize: 12,
    flexWrap: 'wrap'
  },
  scrollableModalImage: {
    width: Dimensions.get('window').width/2,
    height: Dimensions.get('window').width/2
  }
})
