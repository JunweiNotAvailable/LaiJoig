import { View, Text, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import { globalStyles } from '../utils/Constants'

const Button = ( props ) => {
  return (
    <TouchableWithoutFeedback onPress={props.onPress} key={props.key_ || ''}>
      <View style={[globalStyles.flexRow, props.style]}>
        {props.icon ? props.icon : <></>}
        {props.text && <Text style={props.textStyle}>{props.text}</Text>}
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Button