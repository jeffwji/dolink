import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import RNPickerSelect from 'react-native-picker-select'


export default class DaytimePicker extends React.Component {
  constructor(props) {
    super(props)
    this.state ={
      update:0
    }
  }

  //daytime = this.props.defaultValue

  render() {
    const daysOption = []
    for (let i = 0; i < 366; i++){
      daysOption.push(
        { label: `${i} days,`, value: i, key: i, color: 'black' }
      )
    }

    const hoursOption = []
    for (let i = 0; i < 24; i++){
      hoursOption.push(
        { label: `${i} hours,`, value: i, key: i, color: 'black' }
      )
    }

    const minutesOption = []
    for (let i = 0; i < 60; i++){
      minutesOption.push(
        { label: `${i} minutes`, value: i, key: i, color: 'black' }
      )
    }

    return(
      <View style={this.props.defaultStyle}>
        <RNPickerSelect style={styles.picker}
          value={this.props.daytime.days}
          onValueChange={(value) => {
            //this.props.stop.duration.days = value
            //this.daytime.days = value
            this.props.updateNotify(
              {...this.props.daytime, days: value}
            )
          }}
          items={daysOption}
        />

        <RNPickerSelect
          style={styles.text}
          value={this.props.daytime.hours}
          onValueChange={(value) => {
            //this.props.stop.duration.hours = value
            //this.daytime.hours = value
            this.props.updateNotify(
              {...this.props.daytime, hours: value}
            )
          }}
          items={hoursOption}
        />

        <RNPickerSelect
          style={styles.text}
          value={this.props.daytime.minutes}
          onValueChange={(value) => {
            //this.props.stop.duration.minutes = value
            //this.daytime.minutes = value
            this.props.updateNotify(
              {...this.props.daytime, minutes: value}
            )
          }}
          items={minutesOption}
        />
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
  daytime: PropTypes.object.isRequired
};

DaytimePicker.defaultProps = {
  defaultStyle: styles.defaultStyle
};
