import * as Permissions from 'expo-permissions'

import {
  Alert,              // 对话框
  Linking,
  Platform
} from 'react-native'

import * as IntentLauncher from 'expo-intent-launcher'

module.exports = {
  BASE_URL: 'http://192.168.10.112:9000',
  API: {
      login: '/jwt',
      userInfo: '/rest/userinfo',
      plans: '/rest/plans'
  },
  isLogin: false,
  currentLoginUser: '',
  //token: 'eyJhbGciOiJIUzI1NiJ9.eyIkaW50X3Blcm1zIjpbXSwic3ViIjoib3JnLnBhYzRqLmNvcmUucHJvZmlsZS5Db21tb25Qcm9maWxlI251bGwiLCIkaW50X3JvbGVzIjpbIlJPTEVfQ1VTVE9NRVIiXSwiVXNlckluZm8iOiJ7XCJpZFwiOlwiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxXCIsXCJjcmVkZW50aWFsSWRcIjpcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMVwiLFwidXNlcm5hbWVcIjpcImpvaG5AZXhhbXBsZS5jb21cIixcImZpcnN0TmFtZVwiOlwiSm9oblwiLFwibGFzdE5hbWVcIjpudWxsLFwicmVnaXN0ZXJEYXRlXCI6XCIyMDE5LTExLTIxVDE2OjM5OjA2LjUzMVwiLFwiYWN0aXZlXCI6dHJ1ZX0iLCJpYXQiOjE1NzQzODM5MzEsInVzZXJuYW1lIjoiam9obkBleGFtcGxlLmNvbSJ9.ZhYYIMkZM-DQDh_WNYtQSddyHKW4w6lUbO1Y_3TvVAU',
  token: '',

  query(url, method, token) {
    const re = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    const t = (typeof token !== 'undefined')?token.trim():''

    return fetch(url, {
      method: method,
      headers: {
        Authorization: (t!=='')?((re.test(t)?'Bearer ':'Basic ') + t):t
      }
    })
    .then( resp => {
      const statusCode = resp.status
      const json = resp.json()
      return Promise.all([statusCode, json]).then(data => ({
        json: data[1],
        statusCode: data[0]
      }))
    })
  },

  uploadImage(path) {
    const photo = {
      uri: path,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    }

    const body = new FormData()
    body.append('file', photo)

    return fetch('http://192.168.10.112:8080/file', {
      method: 'POST',
      body
    }).then(resp => {
      if(resp.status == 200) {
        const statusCode = resp.status
        const json = resp.json()
        return Promise.all([statusCode, json]).then(data => ({
          json: data[1],
          statusCode: data[0]
        }))
      }
      else
        throw 'Response with error code: ' + resp.status
    })
  },

  async askPermission(setting) {
    const PERMISSIONS = {
      NOTIFOCATIONS: Permissions.NOTIFICATIONS,
      CAMERA_ROLL: Permissions.CAMERA_ROLL,
      CAMERA: Permissions.CAMERA
    }

    const { status } = await Permissions.askAsync(PERMISSIONS[setting]);
    return status === 'granted'
  },
}
