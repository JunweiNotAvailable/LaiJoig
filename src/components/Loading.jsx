import { View, Text, Image, Animated, Easing, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAppState } from '../context/AppContext';

const Loading = ({ size, color, type, white }) => {

  const props = useAppState();

  const spinnerType = type || props.preference.loadingIcon;
  const spinnerSize = size || 42;
  const spinnerColor = color || '#ddd';
  const [spinValue] = useState(new Animated.Value(0));
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    Animated.loop(Animated.timing(spinValue, {
      toValue: 1,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    })).start();
  }, []);

  return (
    spinnerType === 'normal' ?
      <Animated.View style={[styles.spinner, {
        borderColor: spinnerColor,
        borderLeftColor: 'transparent',
        width: spinnerSize,
        height: spinnerSize,
        transform: [{ rotate: spin }]
      }]}/>
    : spinnerType === 'volleyball' ?
      <Animated.View style={[styles.spinner, {
        borderWidth: 0,
        width: spinnerSize,
        height: spinnerSize,
        transform: [{ rotate: spin }]
      }]}>
        <Image style={styles.spinnerImage} source={spinnerColor.includes('fff') ? require('../../assets/images/volleyball-white.png') : require('../../assets/images/volleyball.png')}/>
      </Animated.View>
    : <></>
  )
}

const styles = StyleSheet.create({
  spinner: {
    borderRadius: 50,
    borderWidth: 2, 
  },
  spinnerImage: {
    width: '100%',
    height: '100%',
  },
});

export default Loading