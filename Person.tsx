import React from 'react'

import {
  Container,
  Header,
  Footer,
  Title, 
  Content, 
  Button, 
  Left,
  Right,
  Body, 
  Icon, 
  Text,
  ListItem,
  View
} from 'native-base'

import {
  RefreshControl,
  StyleSheet
} from 'react-native'

import 
  GLOBAL, 
  {
    BASE_URL,
    API, 
    query
  } from './util/Global'

export default class Person extends React.Component {
  constructor(props) {
    super(props)

    const didBlurSubscription = this.props.navigation.addListener(
      'didFocus', payload => {
         this.componentDidMount()
      }
    )

    this.state = {
      isRefreshing: false,
      travelPlans: []
    }
  }

  componentDidMount () {
    if (GLOBAL.token != '') {
      this._refreshTravelPlan()
    }
  }

  render() {
    const {navigate} = this.props.navigation

    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
            <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Header</Title>
          </Body>
          <Right />
        </Header>

        <Content refreshControl={this._renderRefreshControl()} >
          {
            this.state.travelPlans.map( (plan, index) => 
              this._renderRow(plan, index)
            )
          }
        </Content>

        <Footer>
          <Button onPress={() => {
            if (navigate) {
              navigate("Login")
            }
          }}>
            <Text> Logout </Text>
          </Button>
        </Footer>
      </Container>
    )
  }

  _renderRow = (plan, index) => {
    const {navigate} = this.props.navigation

    return(
      <ListItem key={index} Button
        style={styles.planRow}
        onPress={() => {
          if (navigate) {
            navigate("EditPlan", {data: plan})
          }
        }}>
          <View style={styles.planText}>
            <Text style={styles.planId}>{plan.planId}</Text>
            <Text style={styles.planTitle}>{plan.plan.title}</Text>
            <Text style={styles.planOwner}>{plan.owner}</Text>
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
          this._refreshTravelPlan
        }
        tintColor={'#FF0000'}
        title={'Is refresing data, please wait...'}
        titleColor={'#0000FF'}
      />
    )
  }

  _refreshTravelPlan = () => {
    // 刷新数据
    this.setState({isRefreshing: true})

    this._getRecentPlans().then( resp => {
      const { data, status } = resp
      if(data.Status == 200) {
        this.setState({
          travelPlans: data.Result.plans
        })
      }
    }).catch( error => {
      alert(error)
    })

    this.setState({isRefreshing: false})
  }

  _getRecentPlans() {
    return query("http://192.168.10.112:8088/plan/", 'GET', GLOBAL.token)
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
  planId: {
    flexDirection: 'column',
    marginLeft: 10,
    marginTop: 5
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
