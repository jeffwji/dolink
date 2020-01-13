import * as Permissions from 'expo-permissions'

import axios from 'axios'

module.exports = {
  BASE_URL: 'http://192.168.10.112:9000',
  API: {
      login: '/jwt',
      userInfo: '/rest/userinfo',
      plans: '/rest/plans',
      register: '/register'
  },
  isLogin: false,
  currentLoginUser: '',
  token: 'eyJhbGciOiJIUzI1NiJ9.eyIkaW50X3Blcm1zIjpbXSwic3ViIjoib3JnLnBhYzRqLmNvcmUucHJvZmlsZS5Db21tb25Qcm9maWxlI251bGwiLCIkaW50X3JvbGVzIjpbIlJPTEVfQ1VTVE9NRVIiXSwiVXNlckluZm8iOiJ7XCJpZFwiOlwiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxXCIsXCJjcmVkZW50aWFsSWRcIjpcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMVwiLFwidXNlcm5hbWVcIjpcImpvaG5AZXhhbXBsZS5jb21cIixcImZpcnN0TmFtZVwiOlwiSm9oblwiLFwibGFzdE5hbWVcIjpudWxsLFwicmVnaXN0ZXJEYXRlXCI6XCIyMDE5LTExLTIxVDE2OjM5OjA2LjUzMVwiLFwiYWN0aXZlXCI6dHJ1ZX0iLCJpYXQiOjE1NzQzODM5MzEsInVzZXJuYW1lIjoiam9obkBleGFtcGxlLmNvbSJ9.ZhYYIMkZM-DQDh_WNYtQSddyHKW4w6lUbO1Y_3TvVAU',
  //token: '',

  REACT_APP_GOOGLE_MAPS_API: '',
  REACT_APP_GOOGLE_PLACES_API: 'AIzaSyBvVhXwTmCkzwKOxx_sjAi5qroJf_ZE7sc',

  query(url, method, token, formData) {
    const re = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    const t = (typeof token !== 'undefined')?token.trim():''

    return axios({
      method: method,
      url: url,
      data: formData,
      headers: {
        Authorization: (t!=='')?((re.test(t)?'Bearer ':'Basic ') + t):t
      }
    })
  },

  googleMapService(serviceName, parameters) {
    const url = `https://maps.googleapis.com/maps/api/${serviceName}/json?${parameters}&key=AIzaSyBvVhXwTmCkzwKOxx_sjAi5qroJf_ZE7sc`

    return fetch(url).then(response => 
          response.json()
        )
  },

  googleImageService(photoReference, maxWidth, maxHeight=null){
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}` + (maxHeight?`&maxheigth=${maxHeight}`:'') + `&photoreference=${photoReference}&key=AIzaSyBvVhXwTmCkzwKOxx_sjAi5qroJf_ZE7sc`
  },

  uploadImage(path) {
    const photo = {
      uri: path,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    }

    const body = new FormData()
    body.append('file', photo)

    return fetch('http://192.168.10.112:8080/resource-server/file', {
      method: 'POST',
      body
    }).then(resp => {
      const status = resp.status
      const data = resp.json()
      return Promise.all([status, data]).then(p => ({
        data: p[1],
        status: p[0]
      }))
    })
  },

  askPermission(setting) {
    const PERMISSIONS = {
      LOCATION: Permissions.LOCATION,
      NOTIFICATIONS: Permissions.NOTIFICATIONS,
      CAMERA_ROLL: Permissions.CAMERA_ROLL,
      CAMERA: Permissions.CAMERA
    }

    return Permissions.askAsync(PERMISSIONS[setting])
  },

  getLocation(resolve, handleError) {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position), 
      error => handleError(error),
      { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 }
    )
  },
}
