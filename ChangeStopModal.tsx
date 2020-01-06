import React from 'react'
import { Button, Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import DraggableFlatList from 'react-native-draggable-flatlist'

export default class ChangeStopModal extends React.Component {
  render(){
    return (
      <Modal
        isVisible={true}
        onBackdropPress={this.props.close()}
      >
        <View style={styles.conainer}>
          <Text>Long press on the stop you want to change, and move it to new position.</Text>
          {this._renderContent()}
          <View style={{flexDirection: 'row', backgroundColor: '#E1E9FD'}}>
            <Button transparent 
              style={{flex:1}} 
              title="Close" 
              onPress={this.props.close()} 
            />
          </View>
        </View>
      </Modal>)
  }

  _renderContent(){
    if(this.props.mode === 'CHANGE_ORDER'){
      let items = this.props.mapView.stops.map((stop, index) => ({
        order: index,
        stop: stop,
        backgroundColor: `${index%2===0?'#F0DDF7':'#C4D2F7'}`
      }))

      return(
        <View style={styles.content}>
          <DraggableFlatList
            data={items}
            renderItem={this._renderStopList}
            keyExtractor={(item, index) => `stop-order-${item.order}`}
            onDragEnd={({ data }) => {
              this.props.mapView.updateStops(data.map(item => item.stop))
            }}
          />
        </View>
      )
    } else if(this.props.mode === 'CHANGE_LOCATION') {
      return(
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{this.props.mode}</Text>
        </View>
      )
    }
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


const styles = StyleSheet.create({
  conainer: {
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
  }
});