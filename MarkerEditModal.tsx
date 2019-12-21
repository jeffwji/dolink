import React from 'react'
import Modal from 'react-native-modal';


import {
  Button
} from 'native-base'

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'

////////////////////////////////
// Stop edit modal
//
type State = {
    stopEditScrollOffset: null | number;
  };
  
  export default class MarkerEditModal extends React.Component<State> {
      public stopEditScrollViewRef: React.RefObject<ScrollView>;
  
      constructor(props) {
        super(props, {
          stopEditScrollOffset: null,
        })
        
        this.state = {
          stopEditModalVisiblity: false
        }
    
        this.stopEditScrollViewRef = React.createRef();
      }
  
    render() {
      return (
        <Modal
          animationType="fade"
          transparent={true}
          isVisible={this.props.mapView._isStopEditModalVisible()}
          backgroundColor = 'transparent'
          scrollTo={this._handleScrollTo}
          scrollOffset={this.state.stopEditScrollOffset}
          scrollOffsetMax={400 - 300} // content height - ScrollView height
          style={styles.modal}
          >
          <TouchableOpacity 
            style={{
              flex: 1,
              justifyContent: 'flex-end'
            }} 
            activeOpacity={1} 
            onPressOut={() => {
              this.props.mapView._closeStopEditModal()
            }}
          >
            {this._renderMarkerEdit()}
          </TouchableOpacity>
        </Modal>
      )
    }
  
    _renderMarkerEdit() {
      if(this.props.mapView.editingCoordinate) {
        const m = this.props.mapView._getMarkerByCoordinate(this.props.mapView.editingCoordinate)
        if(m) {
          return(
            <TouchableWithoutFeedback>
            <View style={{backgroundColor: '#A9DCD3'}}>
              {this._renderMarkerInformation(m)}
              <ScrollView style={styles.scrollableModal}
                  ref={this.stopEditScrollViewRef}
                  onScroll={this._handleOnScroll}
                  scrollEventThrottle={16}>
                  <TouchableWithoutFeedback>
                    <View>
                    {
                      this._renderMarkerStops(m.props.orders)
                    }
                    </View>
                  </TouchableWithoutFeedback>
                </ScrollView>
            </View>
            </TouchableWithoutFeedback>
          )
        }
      }
      else if (this.props.mapView.isStopEditModalVisible)
        this.props.mapView._closeStopEditModal()
    }
  
    _renderMarkerStops(orders) {
      const content = orders.map((order, index) => 
            <View key={index} style={styles.scrollableModalContent1}>
              <Button onPress={() => {
                this.props.mapView._removeStop(order)
              }}>
                <Text style={styles.scrollableModalText1}>Remove stop {order}</Text>
              </Button>
            </View>
          )
      return content
    }
  
    _renderMarkerInformation(marker) {
      return(
        <View>
          <Text>Something</Text>
        </View>
      )
    }
  
  
    _handleScrollTo = p => {
      if (this.stopEditScrollViewRef.current) {
        this.stopEditScrollViewRef.current.scrollTo(p);
      }
    }
  
    _handleOnScroll = event => {
      this.setState({
        scrollOffset: event.nativeEvent.contentOffset.y,
      });
    }
  }
  
  
  const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    scrollableModal: {
      height: 300,
    },
    scrollableModalContent1: {
      height: 200,
      backgroundColor: '#87BBE0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollableModalText1: {
      fontSize: 20,
      color: 'white',
    },
    scrollableModalContent2: {
      height: 200,
      backgroundColor: '#A9DCD3',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollableModalText2: {
      fontSize: 20,
      color: 'white',
    },
  });
  
  