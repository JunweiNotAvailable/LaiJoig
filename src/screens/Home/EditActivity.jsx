import { View, Text, StyleSheet, Dimensions, Platform, KeyboardAvoidingView, Keyboard, TextInput, SafeAreaView, ScrollView, Pressable, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useEffect } from 'react'
import Toolbar from '../../components/Toolbar';
import { globalStyles } from '../../utils/Constants';
import { getDateString, getDateStringCh, getTimeFromMinutes, getMinutesFromString, to12HourFormat, getRandomString, getDateStringsBetween, cancelScheduledNotification } from '../../utils/Functions';
import Button from '../../components/Button';
import { useHomeState } from '../../context/HomeContext';
import { useAppState } from '../../context/AppContext';
import DatePicker from '../../components/DatePicker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import config from '../../../config.json';

const screenWidth = Dimensions.get('window').width;
const barWidth = screenWidth - 46;
const buttonWidth = 22;

const EditActivity = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useHomeState(), ...route.params };
  const activity = props.activity;

  const date = props.selectedDate;
  // date
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(date);
  const [picking, setPicking] = useState('');
  // time
  const [startTime, setStartTime] = useState(activity.startTime);
  const [endTime, setEndTime] = useState(activity.endTime);
  // description
  const [description, setDescription] = useState(activity.description);
  // notification
  const [hasNotification, setHasNotification] = useState(activity.notificationIds?.length ? true : false);

  const [start, setStart] = useState(getMinutesFromString(startTime) / 1440);
  const [end, setEnd] = useState(getMinutesFromString(endTime) / 1440);
  const [sliding, setSliding] = useState('');

  const pickerProps = { startDate, setStartDate, endDate, setEndDate, picking, setPicking };
  
  useEffect(() => {
    if (getDateString(startDate) > getDateString(endDate)) {
      setEndDate(startDate);
    }
  }, [startDate]);
  
  useEffect(() => {
    setStart(getMinutesFromString(startTime) / 1440);
    setEnd(getMinutesFromString(endTime) / 1440);
  }, [startTime, endTime]);

  // handle mouse move
  const handleMove = (e) => {
    const x = e.nativeEvent.locationX - 22;
    const min = 1439 * (x / barWidth);
    if (sliding === 'start') {
      setStartTime(getTimeFromMinutes(Math.floor((min - (min % 5)))));
    } else if (sliding === 'end') {
      setEndTime(getTimeFromMinutes(Math.floor((min - (min % 5)))));
    }
  }

  // release touch
  const handleRelease = () => setSliding('');

  // check if all variables are valid
  const isValid = () => {
    return getDateString(startDate) <= getDateString(endDate) && startTime <= endTime && description.length > 0;
  }

  const isValidDelete = () => {
    return getDateString(startDate) <= getDateString(endDate);
  }

  // delete the activity
  const handleDelete = async () => {
    if (!isValidDelete()) return;
    const startDateString = getDateString(startDate);
    const endDateString = getDateString(endDate);
    // cancel notifications
    const dates = getDateStringsBetween(startDateString, endDateString);
    for (const d of dates) {
      const notificationId = activity.notificationIds?.find(o => o.dateString === d);
      if (notificationId) {
        await cancelScheduledNotification(notificationId.id);
      }
    }
    // delete entire activity
    if (startDateString === activity.startDateString && endDateString === activity.endDateString) {
      props.setActivities(props.activities.filter(a => a.id !== activity.id));
      navigation.goBack();
      navigation.goBack();
      await axios.delete(`${config.api}/access-item`, {params: {
        table: 'Laijoig-Activities',
        id: activity.id
      }});
      return;
    }
    // set custom details if not delete all
    let custom = activity.custom;
    let notificationIds = activity.notificationIds;
    for (const d of dates) {
      custom[d] = {
        delete: true,
      };
      notificationIds = notificationIds?.filter(o => o.dateString !== d);
    }
    const newActivity = {
      ...activity,
      custom: custom,
      notificationIds: notificationIds,
    };
    props.setActivities(props.activities.map(a => a.id === newActivity.id ? newActivity : a));
    // back to home page
    navigation.goBack();
    navigation.goBack();
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Activities',
      data: newActivity
    });
  }

  // submit the activity
  const handleSubmit = async () => {
    if (!isValid()) return;
    const startDateString = getDateString(startDate);
    const endDateString = getDateString(endDate);
    const dates = getDateStringsBetween(startDateString, endDateString);
    let custom = activity.custom;
    let notificationIds = activity.notificationIds || [];
    for (const d of dates) {
      // set custom details
      custom[d] = {
        iso: new Date().toISOString(),
        startTime: startTime,
        endTime: endTime,
        description: description,
      };
      // remove original notifications
      const notificationId = notificationIds?.find(o => o.dateString === d);
      if (notificationId) {
        await cancelScheduledNotification(notificationId.id);
      }
      // add new notificaitons
      if (hasNotification) {
        const notificationId = await schedulePushNotification(d, startTime, `${props.user.name}即將有一項活動 ${to12HourFormat(startTime)}`, description, 30);
        notificationIds.push({ dateString: d, id: notificationId });
      }
    }
    const newActivity = (startDateString === activity.startDateString && endDateString === activity.endDateString) ? {
      ...activity,
      startTime: startTime,
      endTime: endTime,
      description: description,
      notificationIds: notificationIds,
    } : {
      ...activity,
      custom: custom,
      notificationIds: notificationIds,
    };
    props.setActivities(props.activities.map(a => a.id === newActivity.id ? newActivity : a));
    // back to home page
    navigation.goBack();
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Activities',
      data: newActivity
    });
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={globalStyles.safeArea}>
          <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
            {/* toolbar */}
            <Toolbar text={'編輯活動'}/>
            <ScrollView style={[styles.body, globalStyles.flex1]}
              onStartShouldSetResponder={() => true}
              onResponderMove={handleMove}
              onResponderRelease={handleRelease}
            >
              <Pressable>

                {/* date */}
                <Text style={styles.subtitle}>日期</Text>
                <View style={[globalStyles.flexRow, styles.buttonRow, globalStyles.alignItems.center]}>
                  <Button style={[styles.pickerButton, (picking === 'start' ? styles.pickerButtonFocused : {}), globalStyles.flexCenter]} textStyle={styles.pickerButtonText} text={getDateStringCh(startDate)} onPress={() => setPicking('start')}/>
                  <Text style={{ marginHorizontal: 16 }}>-</Text>
                  <Button style={[styles.pickerButton, (picking === 'end' ? styles.pickerButtonFocused : {}), globalStyles.flexCenter]} textStyle={styles.pickerButtonText} text={getDateStringCh(endDate)} onPress={() => setPicking('end')}/>
                </View>

                {/* time */}
                <Text style={styles.subtitle}>時間</Text>
                <View style={[globalStyles.justifyContent.flexStart, globalStyles.alignItems.center, globalStyles.flexRow]}>
                  <Button text='設為整天' style={styles.allDayButton} textStyle={styles.allDayText} onPress={() => {
                    setStartTime('00:00');
                    setEndTime('23:59');
                  }}/>
                </View>
                <View style={[globalStyles.flexRow, styles.buttonRow, globalStyles.alignItems.center]}>
                  <Text style={styles.timeText}>{to12HourFormat(startTime)}</Text>
                  <Text style={{ marginHorizontal: 8 }}>-</Text>
                  <Text style={styles.timeText}>{to12HourFormat(endTime)}</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <View style={styles.slider}
                    onStartShouldSetResponder={() => true}
                    onResponderStart={(e) => {
                      const x = e.nativeEvent.pageX - 22;
                      const min = 1439 * (x / barWidth);
                      const n = min / 1440;
                      if (Math.abs(n - start) <= Math.abs(n - end)) {
                        setStartTime(getTimeFromMinutes(Math.floor((min - (min % 5)))));
                        setSliding('start')
                      } else {
                        setEndTime(getTimeFromMinutes(Math.floor((min - (min % 5)))));
                        setSliding('end')
                      }
                    }}
                    onResponderMove={handleMove}
                    onResponderRelease={handleRelease}
                  >
                    <View style={styles.sliderBar}>
                      {/* start button */}
                      <View style={[globalStyles.absolute, styles.buttonOutline, globalStyles.flexCenter, (sliding === 'start' ? styles.buttonOutlineActive : {}), {
                        left: start * barWidth - 10,
                      }]} pointerEvents="none">
                        <View style={styles.button}/>
                      </View>
                      {/* progress bar */}
                      <View style={[globalStyles.absolute, styles.bar, {
                        left: start * barWidth,
                        width: barWidth * (end - start)
                      }]}/>
                      {/* end button */}
                      <View style={[globalStyles.absolute, styles.buttonOutline, globalStyles.flexCenter, (sliding === 'end' ? styles.buttonOutlineActive : {}), {
                        left: end * barWidth - 10,
                      }]} pointerEvents="none">
                        <View style={styles.button}/>
                      </View>
                    </View>
                  </View>
                </View>

                {/* description */}
                <Text style={styles.subtitle}>活動</Text>
                <TextInput 
                  style={styles.input} 
                  multiline
                  placeholder='有什麼事要做嗎？'
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                />

                {/* notification */}
                <Button icon={<View style={[styles.checkboxContainer, globalStyles.flex1, globalStyles.flexRow, globalStyles.alignItems.center, globalStyles.justifyContent.flexStart]}>
                  <View style={[styles.checkbox, hasNotification ? styles.checked : {}]}>
                    <Icon name="check" size={10} color="#fff"/>
                  </View>
                  <Text style={{ fontSize: 16 }}>通知 ( 活動前30分鐘 )</Text>
                </View>} onPress={() => setHasNotification(!hasNotification)}/>

                {/* invite people */}
                
                {/* margin bottom */}
                <View style={{ marginBottom: 76 }}/>

              </Pressable>
            </ScrollView>
            <View style={styles.buttonContainer}>
              <Button text='刪除' style={[styles.saveButton, styles.deleteButton, isValidDelete() ? {} : styles.saveButtonDisabled]} textStyle={[styles.buttonText, isValidDelete() ? {} : styles.disabledText]} onPress={handleDelete}/>
            </View>
            <View style={styles.buttonContainer}>
              <Button text='儲存' style={[styles.saveButton, isValid() ? {} : styles.saveButtonDisabled]} textStyle={[styles.buttonText, isValid() ? {} : styles.disabledText]} onPress={handleSubmit}/>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
      {picking !== '' && <DatePicker {...pickerProps} minDate={new Date(activity.startDateString)} maxDate={new Date(activity.endDateString)}/>}
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
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#f3f3f3',
    flex: 1,
  },
  pickerButtonFocused: {
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 16,
  },
  pickerButtonText: {
    textAlign: 'center',
  },
  allDayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f3f3',
    marginVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  sliderContainer: {
    marginVertical: 8,
  },
  slider: {
    padding: 10,
  },
  sliderBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#ccc',
    borderRadius: 10,
  },
  buttonOutline: {
    height: buttonWidth,
    width: buttonWidth,
    top: -(buttonWidth / 2 - 1),
    borderRadius: 20,
  }, 
  buttonOutlineActive: {
    backgroundColor: globalStyles.colors.blue + '44',
  },
  button: {
    width: 12,
    height: 12,
    backgroundColor: globalStyles.colors.blue,
    borderRadius: 10,
  },
  bar: {
    height: '100%',
    backgroundColor: globalStyles.colors.blue + '66',
  },
  input: {
    marginTop: 8,
    borderRadius: 10,
    height: 120,
    borderWidth: 1,
    padding: 8,
    borderColor: '#ccc',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: .4,
    shadowRadius: 2,
  },
  saveButton: {
    position: 'absolute',
    bottom: 16,
    width: 96,
    height: 42,
    borderRadius: 28,
    right: 20,
    backgroundColor: globalStyles.colors.primary,
    ...globalStyles.flexCenter,
    elevation: 2,
  },
  deleteButton: {
    right: 130,
    backgroundColor: globalStyles.colors.red,
  },
  saveButtonDisabled: {
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
  },
  disabledText: {
    color: '#ddd',
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    ...globalStyles.flexCenter,
    borderRadius: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    marginRight: 12,
  },
  checked: {
    backgroundColor: globalStyles.colors.primary,
    borderColor: globalStyles.colors.primary,
  },
});

export default EditActivity