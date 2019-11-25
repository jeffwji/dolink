
// https://docs.expo.io/versions/latest/sdk/imagepicker/
// https://snack.expo.io/@bacon/image-picker
// https://article.itxueyuan.com/5pOZB

import * as React from 'react';
import { Button, Image, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import {askPermission} from './Global'

export default class SignUp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      image: null,
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image style={styles.image} source={{ uri: this.state.image }} />
        <Button
          title="Pickup from camera roll"
          style={styles.button}
          onPress={this._pickImage}
        />
        <Button
          title="Take a photo"
          style={styles.button}
          onPress={this._takePhoto}
        />
      </View>
    );
  }

  _pickImage = async () => {
    if(await askPermission('CAMERA_ROLL')) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1
      });
  
      console.log(result);
  
      if (!result.cancelled) {
        this.setState({ image: result.uri });
      }
    }
  };

  _takePhoto = async () => {
    if(await askPermission('CAMERA')) {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3]
      });
  
      console.log(result);
  
      if (!result.cancelled) {
        this.setState({ image: result.uri });
      }
    }
  };
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },

  image: { width: 300, height: 300, backgroundColor: 'gray' },

  button: {
    padding: 13,
    margin: 15,
    backgroundColor: '#dddddd',
  },

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
