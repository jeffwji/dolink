import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View, Text } from 'react-native';


class StopMarkerPin extends React.Component {
  render() {
    const { fontSize, orders, stopDetail } = this.props
    const content = 
    <View style={styles.container}>
      {(orders.length>0) && 
          <View style={styles.interestedBubble}>
            <Text style={[styles.orders, { fontSize }]}>{stopDetail.description || stopDetail.formatted_address || stopDetail.name}</Text>
            {
              orders.map(({order, duration}, index) => {
                return(
                    <Text key={index} style={[styles.orders, { fontSize }]}>Stop {order+1}: Stay for {duration().days} days {duration().hours} hours {duration().minutes} minutes </Text>
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
  }
}

StopMarkerPin.propTypes =  {
  orders: PropTypes.array.isRequired,
  fontSize: PropTypes.number,
};

StopMarkerPin.defaultProps = {
  fontSize: 13,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    width: 300
  },
  interestedBubble: {
    flex: 0,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
    alignSelf: 'flex-start',
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