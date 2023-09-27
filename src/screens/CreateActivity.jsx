import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import Toolbar from './components/Toolbar';
import { globalStyles } from '../utils/Constants';
import { getDateString, getDateStringCh, to12HourFormat } from '../utils/Functions';
import Button from './components/Button';
import { useHomeState } from './context/HomeContext';
import DatePicker from './components/DatePicker';

const CreateActivity = ({ navigation, route }) => {

  const props = useHomeState();

  const date = route.params.date;
  const now = new Date();
  // date
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(date);
  const [picking, setPicking] = useState('');
  // time
  const [startTime, setStartTime] = useState(`${(now.getHours() + 1).toString().padStart(2, '0')}:00`);
  const [endTime, setEndTime] = useState(`${(now.getHours() + 2).toString().padStart(2, '0')}:00`);
  

  const pickerProps = { startDate, setStartDate, endDate, setEndDate, picking, setPicking };

  useEffect(() => {
    if (getDateString(startDate) > getDateString(endDate)) {
      setEndDate(startDate);
    }
  }, [startDate]);

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* toolbar */}
        <Toolbar/>
        <ScrollView style={[styles.body, globalStyles.flex1]}>
          <Pressable>
            {/* date */}
            <Text style={styles.subtitle}>日期</Text>
            <View style={[globalStyles.flexRow, styles.buttonRow, globalStyles.alignItems.center]}>
              <Button style={[(picking === 'start' ? styles.pickerButtonFocused : styles.pickerButton), globalStyles.flexCenter]} textStyle={styles.pickerButtonText} text={getDateStringCh(startDate)} onPress={() => setPicking('start')}/>
              <Text style={{ marginHorizontal: 16 }}>-</Text>
              <Button style={[(picking === 'end' ? styles.pickerButtonFocused : styles.pickerButton), globalStyles.flexCenter]} textStyle={styles.pickerButtonText} text={getDateStringCh(endDate)} onPress={() => setPicking('end')}/>
            </View>
            {/* time */}
            <Text style={styles.subtitle}>時間</Text>
            <View style={[globalStyles.flexRow, styles.buttonRow, globalStyles.alignItems.center]}>
              <Text style={styles.timeText}>{to12HourFormat(startTime)}</Text>
              <Text style={{ marginHorizontal: 8 }}>-</Text>
              <Text style={styles.timeText}>{to12HourFormat(endTime)}</Text>
            </View>
            {/* description */}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      {picking !== '' && <DatePicker {...pickerProps}/>}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  body: {
    paddingHorizontal: 12,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
  },
  buttonRow: {
    marginTop: 8,
    marginBottom: 12,
  },
  pickerButton: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f3f3',
    borderWidth: .7,
    borderColor: 'transparent',
  },
  pickerButtonFocused: {
    borderWidth: .7,
    borderColor: '#000',
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 16,
  },
  pickerButtonText: {
    textAlign: 'center',
  },
  timeText: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
});

export default CreateActivity