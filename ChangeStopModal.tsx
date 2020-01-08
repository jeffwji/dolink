import React from 'react'
import { Button, Text, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import MapView,  {PROVIDER_GOOGLE, Marker } from 'react-native-maps'


import Modal from "react-native-modal";
import DraggableFlatList from 'react-native-draggable-flatlist'

import AutoCompleteSearchInput from './AutoCompleteSearchInput'

/**
 * 
 */
class MapWindow extends React.Component {
  map = null

  constructor(props) {
    super(props)
    
    this.state = {
      currentLocationCoordinates: this.props.initCoordinates
    }
  }

  render() {
    return(
      <View style={styles.content}>
        <AutoCompleteSearchInput notifyLocationChange={this.notifyLocationChange} containerStyle={{width: 300}}/>
        <MapView
          ref = {map=> this.map = map }
          style={styles.mapView}
          provider={ PROVIDER_GOOGLE }
          initialRegion={this.state.currentLocationCoordinates}
        >
          <Marker coordinate={this.state.currentLocationCoordinates}/>
        </MapView>
      </View>
    )
  }
  
  notifyLocationChange = (details) => {
    this.props.callback(details)
    
    this.setState({ 
      currentLocationCoordinates: {
        ...this.state.currentLocationCoordinates, 
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng
      }
    })

    this.map.animateToRegion(this.state.currentLocationCoordinates)
  }
}

/**
 * 
 */
class ChangeStopOrder extends React.Component{
  stops = null
  constructor(props) {
    super(props)
    this.stops = this.props.stops
  }

  render() {
    let items = this.stops.map((stop, index) => ({
      order: index,
      stop: stop,
      backgroundColor: `${index%2===0?'#F0DDF7':'#C4D2F7'}`
    }))

    return(
      <View style={styles.content}>
        <Text>Long press on the stop you want to change, and move it to new position.</Text>
        <DraggableFlatList
          data={items}
          renderItem={this._renderStopList}
          keyExtractor={(item, index) => `stop-order-${item.order}`}
          onDragEnd={({ data }) => {
            this.stops = data.map(item => item.stop)
            this.props.callback(this.stops)
            this.forceUpdate()
          }}
        />
      </View>
    )
  }

  _renderStopList = ({item, index, drag, isActive}) => {
    const title = item.stop.stopDetail.name || item.stop.stopDetail.formatted_address || item.stop.stopDetail.description
    return (
      <TouchableOpacity
        key={index}
        style={{
          flex: 1,
          backgroundColor: isActive ? 'blue' : item.backgroundColor,
          alignItems: 'flex-start', 
          justifyContent: 'center' 
        }}
        onLongPress={drag}
      >
        <Text style={styles.contentTitle}>{item.order+1} - {title}</Text>
      </TouchableOpacity>
    )
  }
}

/**
 * 
 */
export default class ChangeStopModal extends React.Component {
  stops = null
  stopDetail = null

  render(){
    return (
      <Modal
        isVisible={true}
        onBackdropPress= {() => {
          this._onClose(false)
        }}
      >
        <View style={styles.container}>
          {this._renderContent()}
          <View style={{flexDirection: 'row', backgroundColor: '#E1E9FD'}}>
            <Button transparent 
              style={{flex:1}} 
              title="Cancel" 
              onPress={() => {
                this._onClose(false)
              } }
            />
            <Button transparent 
              style={{flex:1}} 
              title="Ok" 
              onPress={() => {
                this._onClose(true)
              }}
            />
          </View>
        </View>
      </Modal>
    )
  }

  _onClose(update) {
    if(update) {
      if(this.props.mode === 'CHANGE_ORDER'){
        if(this.stops !== null)
          this.props.mapView.updateStops(this.stops)
      } else if(this.props.mode === 'CHANGE_LOCATION') {
        if(this.stopDetail !== null){
          const {order} = this.props.parameters
          this.props.mapView.updateStop(this.stopDetail, order)
          this.props.mapView._updateCurrentLocation({
            latitude: this.stopDetail.geometry.location.lat,
            longitude: this.stopDetail.geometry.location.lng,
            latitudeDelta: this.props.mapView.currentLocationCoordinates.latitudeDelta,
            longitudeDelta: this.props.mapView.currentLocationCoordinates.longitudeDelta
          }, true)
        }
      }
    }

    this.props.close()
  }

  updateStopOrder(stops) {
    this.stops = stops
  }

  updateStopDetail(stopDetail) {
    this.stopDetail = stopDetail
  }

  _renderContent(){
    if(this.props.mode === 'CHANGE_ORDER'){
      return(
        <ChangeStopOrder 
          stops={this.props.mapView.stops} 
          callback={stops => this.updateStopOrder(stops)}
        />
      )

      /*let items = this.props.mapView.stops.map((stop, index) => ({
        order: index,
        stop: stop,
        backgroundColor: `${index%2===0?'#F0DDF7':'#C4D2F7'}`
      }))

      return(
        <View style={styles.content}>
          <Text>Long press on the stop you want to change, and move it to new position.</Text>
          <DraggableFlatList
            data={items}
            renderItem={this._renderStopList}
            keyExtractor={(item, index) => `stop-order-${item.order}`}
            onDragEnd={({ data }) => {
              this.props.mapView.updateStops(data.map(item => item.stop))
            }}
          />
        </View>
      )*/
    } else if(this.props.mode === 'CHANGE_LOCATION') {
      const {order} = this.props.parameters
      const latlng = this.props.mapView.stops[order].stopDetail.geometry.location
      const currentLocationCoordinates = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        latitudeDelta: this.props.mapView.currentLocationCoordinates.latitudeDelta,
        longitudeDelta: this.props.mapView.currentLocationCoordinates.longitudeDelta
      }

      return(
        <MapWindow
          stopDetail = {this.props.mapView.stops[order]}
          initCoordinates={currentLocationCoordinates}
          callback={stops => this.updateStopDetail(stops)}
        />
      )
    }
  }

  /*_renderStopList = ({item, index, drag, isActive}) => {
    const title = item.stop.stopDetail.name || item.stop.stopDetail.formatted_address || item.stop.stopDetail.description
    return (
      <TouchableOpacity
        key={index}
        style={{
          flex: 1,
          backgroundColor: isActive ? 'blue' : item.backgroundColor,
          alignItems: 'flex-start', 
          justifyContent: 'center' 
        }}
        onLongPress={drag}
      >
        <Text style={styles.contentTitle}>{item.order+1} - {title}</Text>
      </TouchableOpacity>
    )
  }*/
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    height: 300,
    //fontSize: 12,
    //marginBottom: 12,
  },
  contentTitle: {
    padding: 5,
    color: 'blue',
    fontSize: 16,
  },
  mapView: {
    flex: 1,
    height: '100%'
  }
});