import React from 'react'

import 
  GLOBAL, 
  {
    BASE_URL,
    API, 
    query
  } from './Global'

import {
    Alert,              // 对话框
    RefreshControl,
    StyleSheet
  } from 'react-native'

import {
  Container,
  Header,
  Content, 
  Button,
  Icon, 
  Text,
  Item,
  Input,
  ListItem,
  View
} from 'native-base'

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    
    const didBlurSubscription = this.props.navigation.addListener(
      'didFocus', payload => {
        console.log('Home: didFocus')
         this.componentDidMount()
      }
    )

    this.state = {
        searchText: '',
        isRefreshing: false,
        travelPlans: []
    }
  }

  componentDidMount () {
    console.log("Home: componentDidMount")

    if (GLOBAL.token != '') {
      this._onRefresh()
    }
    //else {
    //  const {navigate} = this.props.navigation
    //  navigate("Login")
    //}
  }

  render() {
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name='ios-search' />
            <Input placeholder='Search' 
              onChangeText={ (text) => {
                this.setState({searchText: text})
                console.log('Input is: ' + this.state.searchText)
              } }/>
            <Button transparent
              onPress={ () =>
                Alert.alert('Search: ' + this.state.searchText, null, null)
              }
            >
              <Text>Search</Text>
            </Button>
          </Item>
        </Header>

        <Content refreshControl={this._renderRefreshControl()} >
          {this.state.travelPlans.map( (plan) => this._renderRow(plan) )}
        </Content>
      </Container>
    )
  }

  _renderRow = (plan) => {
    const {navigate} = this.props.navigation

    return(
      <ListItem Button
        style={styles.planRow}
        onPress={() => {
          if (navigate) {
            navigate("Detail", {data: plan})
          }
        }}>
          <View style={styles.planText}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planOwner}>{plan.ownerId}</Text>
          </View>
      </ListItem>
    )
  }

  _renderRefreshControl() {
    return(
      <RefreshControl
        refreshing={this.state.isRefreshing}
        onRefresh={
          // 调用刷新函数
          this._onRefresh
        }
        tintColor={'#FF0000'}
        title={'Is refresing data, please wait...'}
        titleColor={'#0000FF'}
      />
    )
  }

  _getRecentPlans() {
    return query(BASE_URL+API.plans, 'GET', GLOBAL.token)
  }

  _onRefresh = () => {
    // 刷新数据
    this.setState({isRefreshing: true})

    this._getRecentPlans().then( data => {
      const { json } = data
      if(json.Status == 'Ok') {
        this.setState({
          travelPlans: json.Result
        })
      }
    }).catch( error => {
      alert(error)
    })

    this.setState({isRefreshing: false})
  }
}

const styles = StyleSheet.create({
  planRow: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  planImage: {
    marginLeft: 10,
  },
  planText: {
    flexDirection: 'column',
    marginLeft: 10,
    marginTop: 5
  },
  planTitle: {
    flex: 1,
    fontSize: 16
  },
  planOwner: {
    flex: 1,
    fontSize: 14,
    color: 'gray'
  },
})