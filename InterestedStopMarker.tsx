import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View, Text } from 'react-native';

const propTypes = {
  orders: PropTypes.array.isRequired,
  fontSize: PropTypes.number,
};

const defaultProps = {
  fontSize: 13,
};

class InterestedStopMarker extends React.Component {
  render() {
    const { fontSize, orders } = this.props;
    return(
      <View style={styles.container}>
        {(orders.length>0) && 
            <View style={styles.interestedBubble}>
                <Text style={[styles.orders, { fontSize }]}>{orders.join()}</Text> 
            </View>
        }
        {(orders.length==0) && 
            <View style={styles.candidateBubble}>
                <Text style={[styles.orders, { fontSize }]}>{orders}</Text> 
            </View>
        }
        <View style={styles.arrowBorder} />
        <View style={styles.arrow} />
      </View>
    )
  }
}

InterestedStopMarker.propTypes = propTypes;
InterestedStopMarker.defaultProps = defaultProps;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  interestedBubble: {
    flex: 0,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#FF5A5F',
    padding: 10,
    borderRadius: 3,
    borderColor: '#D23F44',
    borderWidth: 0.5,
  },
  candidateBubble: {
    flex: 0,
    flexDirection: 'row',
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

export default InterestedStopMarker;