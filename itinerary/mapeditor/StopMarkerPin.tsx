import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View, Text, Image } from 'react-native';

class StopMarkerPin extends React.Component {
  render() {
    const { fontSize, orders, stopDetail } = this.props

    switch(this.props.mode){
      case 0:
        let content = 
          <View style={styles.container}>
            {(orders.length>0) && 
                <View style={styles.interestedBubble}>
                  <Text style={[styles.orders, { fontSize }]}>{stopDetail.description || stopDetail.formatted_address || stopDetail.name}</Text>
                  {
                    orders.map(({order, duration}, index) => {
                      return(
                        <Text key={index} style={[styles.orders, { fontSize }]}>Stop {order+1}: Stay for {duration().days===0?'':duration().days+' days'} {duration().hours===0?'':duration().hours+' hours'} {duration().minutes===0?'':duration().minutes+' minutes'}</Text>
                      )
                    })
                  }
                </View>
            }
            {(orders.length==0) && 
                <View style={styles.candidateBubble}>
                <Text style={[styles.orders, { fontSize }]}>{stopDetail.description || stopDetail.formatted_address || stopDetail.name}</Text> 
                </View>
            }
            <View style={styles.arrowBorder} />
            <View style={styles.arrow} />
          </View>
        return(content)

      case 1:
        content = 
          <View style={styles.container}>
            {(orders.length>0) && 
                <View style={styles.interestedBubble}>
                  <Text style={[styles.orders, { fontSize }]}>{orders.map(o=>o.order+1).join()}</Text>
                </View>
            }
            {(orders.length==0) && 
                <View style={styles.candidateBubble}>
                  <Text style={[styles.orders, { fontSize }]}>?</Text> 
                </View>
            }
            <View style={styles.arrowBorder} />
            <View style={styles.arrow} />
          </View>
        return(content)

      case 2:
        return(
          <View style={styles.container}>
            {(orders.length>0) && <Image source={require("../../assets/LandMarker_selected_64.png")} style={{width: 32, height: 32}} />}
            {(orders.length==0) && <Image source={require("../../assets/LandMarker_unselected_64.png")} style={{width: 32, height: 32}} />}
          </View>
        )
    }
  }
}

StopMarkerPin.propTypes =  {
  orders: PropTypes.array.isRequired,
  mode: PropTypes.number.isRequired,
  fontSize: PropTypes.number,
};

StopMarkerPin.defaultProps = {
  mode: 0,
  fontSize: 13,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'center',
    alignItems: 'center',
    width: 200
  },
  interestedBubble: {
    flex: 0,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FF5A5F',
    padding: 10,
    borderRadius: 3,
    borderColor: '#D23F44',
    borderWidth: 0.5,
  },
  candidateBubble: {
    flex: 0,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffaca6',
    padding: 10,
    borderRadius: 3,
    borderColor: '#FF5A5F',
    borderWidth: 0.5,
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#FF5A5F',
    alignSelf: 'center',
    marginTop: -9,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: '#D23F44',
    alignSelf: 'center',
    marginTop: 0.5,
  },
  dollar: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  orders: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});

export default StopMarkerPin;