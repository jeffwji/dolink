import React from 'react'
import {googleMapService} from './Global'

import {Text, TouchableOpacity, StyleSheet} from "react-native";

import Autocomplete from "react-native-autocomplete-input"


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
				data={this.state.items}
				defaultValue={this.state.defaultValue}
				onChangeText={ text => {
					googleMapService('place/autocomplete', `input=${text}`)
						.then(json => this.setState({
							items: json.predictions
						}))
				}}
				keyExtractor={item => {return item.place_id}}
				renderItem={({ item, i }) => (
					<TouchableOpacity
						key={i}
						onPress={() => {
							const value = item.description || item.formatted_address || item.name
							this.setState({
								defaultValue: value,
								items: []
							})

							googleMapService('place/details', `place_id=${item.place_id}`)
								.then(details => this.props.notifyLocationChange(details))
						}}
					>
						<Text>{item.description || item.formatted_address || item.name}</Text>
					</TouchableOpacity>
				)}
				renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
				containerStyle={googleSearchInput.container}
				inputContainerStyle={googleSearchInput.inputContainerStyle}
				listContainerStyle={googleSearchInput.listContainerStyle}
				listStyle={googleSearchInput.listStyle}
			/>
		)
	}
}


const googleSearchInput = StyleSheet.create({
	container: {
		width: 300
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