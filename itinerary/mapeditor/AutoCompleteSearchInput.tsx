import React from 'react'
import {googleMapService} from '../../util/Global'

import {Text, View, TouchableOpacity, StyleSheet, Keyboard} from "react-native";

import Autocomplete from "react-native-autocomplete-input"
import PropTypes from 'prop-types';

/**
 * https://github.com/mrlaessig/react-native-autocomplete-input#readme
 */

export default class AutoComoleteSearchInput extends React.Component {
	constructor(props) {
		super(props)
	}

	state = {
		items: [],
		defaultValue: '',
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
							.then(json => {
								const addresses = this._getFixedOptions().concat(json.predictions)
								this.setState({
									items: addresses
								})
							})
					} else {
						this.setState({
							items: this._getFixedOptions()
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
				containerStyle={[styles.container, this.props.style]}
				inputContainerStyle={styles.inputContainerStyle}
				listContainerStyle={styles.listContainerStyle}
				listStyle={styles.listStyle}
			/>
		)
	}

	_getFixedOptions():Array {
		return []
	}
}

AutoComoleteSearchInput.propTypes = {
	notifyLocationChange: PropTypes.func.isRequired,
	styles: PropTypes.any
}

const styles = StyleSheet.create({
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