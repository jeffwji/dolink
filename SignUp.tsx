
// https://docs.expo.io/versions/latest/sdk/imagepicker/
// https://snack.expo.io/@bacon/image-picker
// https://article.itxueyuan.com/5pOZB

import * as React from 'react';
import { Image, ScrollView, View, StyleSheet, Alert } from 'react-native';
import {
  Form, 
  Item, 
  Label, 
  Input, 
  Icon,
  Button,
  Text} from 'native-base'
import * as ImagePicker from 'expo-image-picker'
import CountryPicker from 'react-native-country-picker-modal'
import OptionsMenu from "react-native-options-menu"
import RadioGroup from 'react-native-radio-buttons-group'
import DatePicker from 'react-native-datepicker'

import GLOBAL, {askPermission, uploadImage, query} from './Global'
import Login from './Login'

export default class SignUp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      avatar: require('./assets/avatar.jpg'),
      username: '',
      usernameMsg: 'usernameMsg',
      password: '',
      passwordMsg: 'passwordMsg',
      firstName: '',
      firstNameMsg: 'firstNameMsg',
      lastName: '',
      lastNameMsg: 'lastNameMsg',
      birthDay: null,
      birthDayMsg: 'birthDayMsg',
      gender: 1,
      genderMsg: 'genderMsg',
      countryCode: 'US',
      countryMsg: 'countryMsg',
      country: '',

      password_icon: "eye-off",
      isSecure: true,
      genderOptions: [
        {
          label: 'Male',
          value: 1
        },
        {
          label: 'Female',
          value: 2
        }
      ],
      avatarOptions: [
        "Select from gallery",
        "Take photo",
        "Cancel"
      ]
    }
  }

  render() {
    const myIcon = (<Image 
      style={styles.avatar} 
      source={this.state.avatar } />)

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Form>
          <OptionsMenu
            customButton={myIcon}
            destructiveIndex={1}
            options={this.state.avatarOptions}
            actions={[this._pickImage, this._takePhoto, this._cancel]}/>

          <Item floatingLabel>
            <Label>Email</Label>
            <Input autoCapitalize = 'none'
              onChangeText={ (text) => {
                this.setState({username: text.toLowerCase()})
              }}/>
            <Label>{this.state.usernameMsg}</Label>
          </Item>

          <Item floatingLabel last>
            <Label>Password</Label>
            <Input secureTextEntry={this.state.isSecure}
              autoCapitalize = 'none'
              onChangeText={ (text) => {
                this.setState({password: text})
            }}/>
            <Label>{this.state.passwordMsg}</Label>
            <Icon name={this.state.password_icon} 
              onPress={() => this._changePasswordIcon()} 
            />
          </Item>

          <Item floatingLabel last>
            <Label>First name</Label>
            <Input onChangeText={ (text) => {
              this.setState({firstName: text})
            }}/>
            <Label>{this.state.firstNameMsg}</Label>
          </Item>

          <Item floatingLabel last>
            <Label>Last name</Label>
            <Input onChangeText={ (text) => {
              this.setState({lastName: text})
            }}/>
            <Label>{this.state.lastNameMsg}</Label>
          </Item>

          <View style={styles.row}>
            <Label>BirthDate</Label>
            <DatePicker 
              style={{ width: 200 }} 
              date={this.state.birthDay} 
              mode="date"
              placeholder="select date"
              animationType={"fade"}
              format="YYYY-MM-DD" 
              minDate="1916-01-01"
              maxDate="2019-12-31" 
              confirmBtnText="Confirm" 
              cancelBtnText="Cancel" 
              onDateChange={date => this._dateChangedHandler(date)}
            />
            <Label>{this.state.birthDayMsg}</Label>
          </View>

          <View style={styles.row}>
            <Text>Gender</Text>
            <RadioGroup flexDirection='row'
              radioButtons={this.state.genderOptions} 
              onPress={ gender =>
                this._selectGender(gender)
              } 
            />
            <Label>{this.state.genderMsg}</Label>
          </View>

          <View style={styles.row}>
            <Label>Country</Label>
            <CountryPicker 
              countryCode={this.state.countryCode}
              withFlag={true}
              withCountryNameButton={true}
              onSelect={country => this._onCountrySelected(country)}
            />
            <Label>{this.state.countryMsg}</Label>
          </View>

          <Button transparent
              onPress={ () => {
                const {navigate} = this.props.navigation
                const uploadAvatar = async (avatar) =>{
                  if (avatar.uri != undefined) {
                    return uploadImage(avatar.uri)
                      .then(resp => {
                        const { data, status } = resp
                        if(status == 200)
                          return this._register(data[0])
                        else
                          throw "Can't upload avatar"
                      })
                  } else {
                    return this._register(null)
                  }
                }

                uploadAvatar(this.state.avatar).then(resp => {
                      const {data, status } = resp
                      console.log(JSON.stringify(data))
                      if (status === 201)
                        (new Login(this.props)).login(this.state.username, this.state.password)
                      else {
                        console.log('Register failed with code: ' + status)
                        return false
                      }
                    })
                    .catch(error => {
                      console.log("data: " + JSON.stringify(error.response.data))
                      return false
                    })
            } }
          >
            <Text>Sign me up!</Text>
          </Button>
        </Form>
      </ScrollView>
    );
  }

  _register(avatorId) {
    return query(
      GLOBAL.BASE_URL + GLOBAL.API.register, 
      'POST', 
      GLOBAL.token,
      {
        'avatar': avatorId,
        'username': this.state.username,
        'password': this.state.password,
        'firstName': this.state.firstName,
        'lastName': this.state.lastName,
        'birthday': this.state.birthDay,
        'country': this.state.countryCode,
        'gender': this.state.gender
      }
    )
  }

  _onCountrySelected(country) {
    this.setState({countryCode: country.cca2})
    this.setState({country: country})
  }

  _selectGender(gender) {
    gender.map(g => {
      if (g.selected) this.setState({gender: g.value})
    })
  }

  _dateChangedHandler(date:Date) {
    this.setState({birthDay : date})
  }

  _changePasswordIcon() {
    this.setState(prevState => ({
      password_icon: prevState.password_icon === 'eye' ? 'eye-off': 'eye',
      isSecure: !prevState.isSecure
    }))
  }

  _pickImage = async () => {
    if(await askPermission('CAMERA_ROLL')) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1
      });
  
      if (!result.cancelled) {
        this.setState({ avatar: {uri: result.uri} });
      }
    }
  };

  _takePhoto = async () => {
    if(await askPermission('CAMERA')) {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1
      });
      
      if (!result.cancelled) {
        this.setState({ avatar: {uri: result.uri} });
      }
    }
  };

  _cancel = async () => {}
}

const styles = StyleSheet.create({
  avatar: { width: 200, height: 200, backgroundColor: 'gray' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white'
  },

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
