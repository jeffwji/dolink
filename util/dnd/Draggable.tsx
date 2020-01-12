import React from 'react';

import {
    Text,
    View,
    Animated,
    PanResponder
} from 'react-native'

import {ListItem} from 'native-base'

import PropTypes from 'prop-types'

export default class Draggable extends React.Component {
    constructor(props) {
        super(props)
    }

    animatedValue = null
    _value = null
    panResponder = null

    componentWillMount() {
        this.animatedValue = new Animated.ValueXY();
        this._value = {x: 0, y: 0}
        this.animatedValue.addListener((value) => this._value = value);

        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            
            onPanResponderGrant: (e, gestureState) => {
                this.animatedValue.setOffset({
                    x: this._value.x,
                    y: this._value.y,
                })
                this.animatedValue.setValue({ x: 0, y: 0})
            },
            onPanResponderMove: Animated.event([
                null, { dx: this._value.x /*this.animatedValue.x*/, dy: this.animatedValue.y}
            ]),
            onPanResponderRelease: (e, gestureState) => {
                this.animatedValue.flattenOffset();
                Animated.decay(this.animatedValue, {
                    deceleration: 0.0,
                    velocity: { x: gestureState.vx, y: gestureState.vy }
                }).start();
            },
        })
    }

    render(){
        const panStyle = {
            transform: this.animatedValue.getTranslateTransform()
        }

        return (
            <Animated.View id={this.props.id} style={[panStyle, this.props.style]}>
                <ListItem>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{marginRight: 10}} {...this.panResponder.panHandlers}><Text>+</Text></View>
                            {this.props.children}
                        </View>
                </ListItem>
            </Animated.View>
        );
    }
}

Draggable.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node
}