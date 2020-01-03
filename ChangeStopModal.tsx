import React from 'react'
import { SafeAreaView, Button, Text, View, StyleSheet } from "react-native";
import Modal from "react-native-modal";

export default class ChangeStopModal extends React.Component {    
  render(){
    return (
      <Modal
        isVisible={true}
        onBackdropPress={this.props.close()}
      >
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{this.props.mode}</Text>
          <Button title="Close modal" onPress={this.props.close()} />
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
      contentTitle: {
        fontSize: 20,
        marginBottom: 12,
      }
  });