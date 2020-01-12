import React from 'react';

import {
    Content
  } from 'native-base'

import PropTypes from 'prop-types'

export default class Droppable extends React.Component {
    drop = (e) => {
        e.preventDefault()
        const data = e.dataTransfer.getData('transfer')
        e.target.appendChild(document.getElementById(data))
    }

    allowDrop = (e) => {
        e.preventDefault()
    }

    render(){
        return(
            <Content style = {this.props.style} id={this.props.id}>
                {this.props.children}
            </Content>
        )
    }
}

Droppable.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node
}
