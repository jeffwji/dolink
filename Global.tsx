module.exports = {
    BASE_URL: 'http://192.168.10.112:9000',
    API: {
        login: '/jwt',
        plans: '/rest/plans'
    },
    isLogin: false,
    //token: 'eyJhbGciOiJIUzI1NiJ9.eyIkaW50X3Blcm1zIjpbXSwic3ViIjoib3JnLnBhYzRqLmNvcmUucHJvZmlsZS5Db21tb25Qcm9maWxlI251bGwiLCIkaW50X3JvbGVzIjpbIlJPTEVfQ1VTVE9NRVIiXSwiVXNlckluZm8iOiJ7XCJpZFwiOlwiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxXCIsXCJjcmVkZW50aWFsSWRcIjpcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMVwiLFwidXNlcm5hbWVcIjpcImpvaG5AZXhhbXBsZS5jb21cIixcImZpcnN0TmFtZVwiOlwiSm9oblwiLFwibGFzdE5hbWVcIjpudWxsLFwicmVnaXN0ZXJEYXRlXCI6XCIyMDE5LTExLTIxVDE2OjM5OjA2LjUzMVwiLFwiYWN0aXZlXCI6dHJ1ZX0iLCJpYXQiOjE1NzQzODM5MzEsInVzZXJuYW1lIjoiam9obkBleGFtcGxlLmNvbSJ9.ZhYYIMkZM-DQDh_WNYtQSddyHKW4w6lUbO1Y_3TvVAU',
    token: '',

    query(url, method, token) {
        return fetch(url, {
          method: method,
          headers: {
            Authorization: 'Bearer ' + token.trim()
          }
        })
        .then( response => {
          return response.json()
        })
    }
}