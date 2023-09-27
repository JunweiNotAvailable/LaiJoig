import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { globalStyles } from '../../utils/Constants';
import Button from './Button';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Toolbar = () => {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, globalStyles.flexRow, globalStyles.alignItems.center]}>
      <Button icon={<Entypo name='chevron-left' size={28} style={styles.backButtonStyle} onPress={() => navigation.goBack()}/>}/>
      <Text style={styles.title}>新增活動</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  backButtonStyle: {
    padding: 6,
  },
  title: {
    fontSize: 16,
    marginStart: 4,
  },
});

export default Toolbar