import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import PickerSelect from 'react-native-picker-select'


export default class DaytimePicker extends React.Component {
  constructor(props) {
    super(props)
    this.state ={
      update:0
    }
  }

  render() {
    const daysOption = []
    for (let i = 0; i < 366; i++){
      daysOption.push(
        { label: `${i} days`, value: i, key: i, color: 'black' }
      )
    }

    const hoursOption = []
    for (let i = 0; i < 24; i++){
      hoursOption.push(
        { label: `${i} hours`, value: i, key: i, color: 'black' }
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
        <PickerSelect
          style={pickerStyle}
          value={this.props.daytime.days}
          onValueChange={(value) => {
            this.props.updateNotify(
              {...this.props.daytime, days: value}
            )
          }}
          items={daysOption}
        />

        <PickerSelect
          style={pickerStyle}
          value={this.props.daytime.hours}
          onValueChange={(value) => {
            this.props.updateNotify(
              {...this.props.daytime, hours: value}
            )
          }}
          items={hoursOption}
        />

        <PickerSelect
          style={pickerStyle}
          value={this.props.daytime.minutes}
          onValueChange={(value) => {
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

const pickerStyle = {
	inputIOS: {
		color: 'white',
		//paddingTop: 13,
		//paddingHorizontal: 10,
    //paddingBottom: 12,
    paddingRight: 2
	},
	inputAndroid: {
		color: 'white',
	},
	placeholderColor: 'white',
	underline: { borderTopWidth: 0 },
	icon: {
		position: 'absolute',
		backgroundColor: 'transparent',
		borderTopWidth: 5,
		borderTopColor: '#00000099',
		borderRightWidth: 5,
		borderRightColor: 'transparent',
		borderLeftWidth: 5,
		borderLeftColor: 'transparent',
		width: 0,
		height: 0,
		top: 20,
		right: 15,
	},
};

const styles = StyleSheet.create({
  defaultStyle: {
    flexDirection: 'row'
  },
});

DaytimePicker.propTypes = {
  daytime: PropTypes.object.isRequired
};

DaytimePicker.defaultProps = {
  defaultStyle: styles.defaultStyle
};
