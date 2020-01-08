import React from 'react'
import {googleMapService} from './Global'

import {Text, View, TouchableOpacity, StyleSheet, Keyboard} from "react-native";

import Autocomplete from "react-native-autocomplete-input"
import PropTypes from 'prop-types';

/**
 * https://github.com/mrlaessig/react-native-autocomplete-input#readme
 */

export default class AutoCpmoleteSearchInput extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			items: [],
			defaultValue: ''
		}
	}

    render() {
		return(
			<Autocomplete
				clearButtonMode={'always'}
				data={this.state.items}
				defaultValue={this.state.defaultValue}
				onChangeText={ text => {
					if(text != "") {
						googleMapService('place/autocomplete', `input=${text}`)
							.then(json => this.setState({
								items: json.predictions
							}))
					} else {
						this.setState({
							items: []
						})
					}
				}}
				keyExtractor={item => {
					return item.place_id
				}}
				renderItem={({ item, i }) => (
					<TouchableOpacity
						key={i}
						onPress={() => {
							Keyboard.dismiss()
							const value = item.description || item.formatted_address || item.name
							this.setState({
								defaultValue: value,
								items: []
							})

							googleMapService('place/details', `place_id=${item.place_id}`)
								.then(details => this.props.notifyLocationChange(details.result))
						}}
					>
						<Text>{item.description || item.formatted_address || item.name}</Text>
					</TouchableOpacity>
				)}
				renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
				containerStyle={[googleSearchInput.container, this.props.containerStyle]}
				inputContainerStyle={googleSearchInput.inputContainerStyle}
				listContainerStyle={googleSearchInput.listContainerStyle}
				listStyle={googleSearchInput.listStyle}
			/>
		)
	}
}

AutoCpmoleteSearchInput.propTypes = {
	notifyLocationChange: PropTypes.func.isRequired,
	containerStyle: PropTypes.any
}

const googleSearchInput:Sty = StyleSheet.create({
	container: {
	},
	inputContainerStyle: {
	  backgroundColor: 'rgba(0,0,0,0)',
	  borderTopWidth: 1,
	  borderBottomWidth:1,
	  width: '100%',
	  borderRadius: 0.2,
	},
	listContainerStyle: {
	},
	listStyle: {
	  backgroundColor: '#fff',
	},
	separator: {
		flex: 1,
		height: StyleSheet.hairlineWidth,
		backgroundColor: '#8E8E8E',
	}
  });