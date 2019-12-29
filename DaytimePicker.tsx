import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import RNPickerSelect from 'react-native-picker-select'

export default class DaytimePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      days: 0,
      hours: 1,
      minutes: 0
    }
  }

  render() {
    const daysOption = []
    for (let i = 0; i < 366; i++){
      daysOption.push(
        { label: `${i}`, value: i, key: i, color: 'black' }
      )
    }

    const hoursOption = []
    for (let i = 0; i < 24; i++){
      hoursOption.push(
        { label: `${i}`, value: i, key: i, color: 'black' }
      )
    }

    const minutesOption = []
    for (let i = 0; i < 60; i++){
      minutesOption.push(
        { label: `${i}`, value: i, key: i, color: 'black' }
      )
    }

    return(
      <View style={this.props.defaultStyle}>
        <Text style={styles.text}>{this.props.title}: </Text>
        <RNPickerSelect style={styles.picker}
          value={this.state.days}
          onValueChange={(value) => this.setState({days: value})}
          items={daysOption}
        />
        <Text style={styles.text}> Days, </Text>

        <RNPickerSelect
          style={styles.text}
          value={this.state.hours}
          onValueChange={(value) => this.setState({hours: value})}
          items={hoursOption}
        />
        <Text style={styles.text}> Hours, </Text>

        <RNPickerSelect
          style={styles.text}
          value={this.state.minutes}
          onValueChange={(value) => this.setState({minutes: value})}
          items={minutesOption}
        />
        <Text style={styles.text}> Minutes</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    flexDirection: 'row',
    color: 'white'
  },

  text: {
    color: 'white'
  },

  picker: {
    borderWidth: 1,
    borderColor: 'purple',
    color: 'red',
  }
});

DaytimePicker.propTypes = {
  title: PropTypes.string.isRequired
};

DaytimePicker.defaultProps = {
  defaultStyle: styles.defaultStyle,
  title: ''
};
