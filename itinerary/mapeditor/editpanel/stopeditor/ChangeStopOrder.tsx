import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity} from "react-native";


import DraggableFlatList from 'react-native-draggable-flatlist'

/**
 * 
 */
export default class ChangeStopOrder extends React.Component{
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
          backgroundColor: isActive ? 'rgba(153,153,255, 1)' : item.backgroundColor,
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
  