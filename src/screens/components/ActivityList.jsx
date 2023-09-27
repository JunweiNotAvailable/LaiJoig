import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { globalStyles, weekDays } from '../../utils/Constants';
import { getDateString } from '../../utils/Functions';
import Button from './Button';
import { useNavigation } from '@react-navigation/native';

const ActivityList = ( props ) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, globalStyles.flex1]}>
      {/* title */}
      <View style={[styles.title, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
        <Text style={styles.titleText}>{getDateString(props.selectedDate).replaceAll('-', ' / ')} {weekDays[props.selectedDate.getDay()]}</Text>
        <Button
          style={styles.addButton}
          text={'新增'}
          textStyle={{ fontSize: 16 }}
          onPress={() => navigation.navigate('CreateActivity', { date: props.selectedDate })}
        />
      </View>
      {/* scroll view */}
      <ScrollView></ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  title: {
    paddingVertical: 4,
  },
  titleText: {
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
    paddingHorizontal: 12,
  },
});

export default ActivityList