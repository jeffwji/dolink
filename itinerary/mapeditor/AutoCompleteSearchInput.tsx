import React from 'react'
import {googleMapService, askPermission, getLocation} from '../../util/Global'
import { coordinate2string} from '../../util/Location'

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
		items: this._getFixedOptions(),
		defaultValue: '',
		hideResults: true
	}

	ref = null

    render() {
		const autocomplete = <Autocomplete
			clearButtonMode={'always'}
			ref = {ref => this.ref = ref}
			data={this.state.items}
			defaultValue={this.state.defaultValue}
			hideResults = {this.state.hideResults}
			onFocus = {e => 
				this.setState({
					hideResults: false
				})
			}
			onBlur = {e => 
				this.setState({
					//items: this._getFixedOptions(),
					hideResults: true
				})
			}
			onChangeText={ text => {
				if(text != "") {
					googleMapService('place/autocomplete', `input=${text}`)
						.then(json => {
							const addresses = json.predictions
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
			keyExtractor={(item, index) => {
				if(item.place_id)
					return item.place_id
				else return ""+ index
			}}
			renderItem={({ item, i }) => (
				<TouchableOpacity
					key={i}
					onPress={ e => {
						Keyboard.dismiss()
						const value = item.description || item.formatted_address || item.name
						this.setState({
							defaultValue: value,
							items: [],
							//hideResults: true
						})
						
						switch(item.type) {
							case 'CURRENT_LOCATION':
								askPermission('LOCATION').then(permit => {
									if(permit) {
										getLocation(
											latlng => {
												googleMapService("geocode", `latlng=${coordinate2string(latlng.coords)}`)
													.then(details => {
														if(details.results.length > 0)
															this.props.notifyLocationChange(details.results[0])
													})
											},
											error => {
											  	console.log(error)
											}
										)
									}
								})
								break;
							case 'BOOKMARK':
								break;
							default:
								googleMapService('place/details', `place_id=${item.place_id}`)
									.then(details => this.props.notifyLocationChange(details.result))
								break;
						}
					}}
				>
					<Text>{item.description || item.formatted_address || item.name}</Text>
				</TouchableOpacity>
			)}
			onStartShouldSetResponderCapture = { e => {
				console.log(e)
			}}
			renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
			containerStyle={[styles.container, this.props.style]}
			inputContainerStyle={styles.inputContainerStyle}
			listContainerStyle={styles.listContainerStyle}
			listStyle={styles.listStyle}
		/>

		return(
			autocomplete
		)
	}

	_getFixedOptions():Array {
		return [
			{
				description: 'Current location',
				type: 'CURRENT_LOCATION'
			},
			{
				description: 'Home',
				type: 'BOOKMARK',
				place_id: 'xxxx'
			}
		]
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