import { View, StyleSheet, Text } from 'react-native'
import React from 'react'
import { globalStyles } from '../utils/Constants';

const Topbar = ({ title, buttons }) => {
  return (
    <View style={[styles.container, globalStyles.alignItems.center, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween]}>
      <Text style={styles.title}>{title}</Text>
      {buttons.map((button, i) => button)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});

export default Topbar