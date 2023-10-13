import { View, Text, Image, StyleSheet, Dimensions, Platform, KeyboardAvoidingView, Keyboard, TextInput, SafeAreaView, ScrollView, Pressable, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useEffect } from 'react'
import Toolbar from '../../components/Toolbar';
import { globalStyles } from '../../utils/Constants';
import { getDateString, getDateStringCh, getTimeFromMinutes, getMinutesFromString, to12HourFormat, getRandomString, schedulePushNotification, getDateStringsBetween, sendPushNotification } from '../../utils/Functions';
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

const CreateActivity = () => {

  const navigation = useNavigation();
  const props = { ...useAppState(), ...useHomeState() };

  const date = props.selectedDate;
  const now = new Date();
  // date
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(date);
  const [picking, setPicking] = useState('');
  // time
  const [startTime, setStartTime] = useState(`08:00`);
  const [endTime, setEndTime] = useState('16:00');
  // description
  const [description, setDescription] = useState('');
  // notification
  const [hasNotification, setHasNotification] = useState(true);
  // inviting users
  const [invitingUsers, setInvitingUsers] = useState([]);

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

  // submit the activity
  const handleSubmit = async () => {
    if (!isValid()) return;
    const startDateString = getDateString(startDate);
    const endDateString = getDateString(endDate);
    // schedule notification
    const notificationIds = [];
    const dates = getDateStringsBetween(startDateString, endDateString);
    for (const ds of dates) {
      const notificationId = hasNotification ? await schedulePushNotification(ds, startTime, `${props.user.name}${to12HourFormat(startTime)}有一項活動`, description, 30) : null;
      hasNotification && notificationIds.push({ dateString: ds, id: notificationId });
    }
    // create new activity
    const newActivity = {
      id: getRandomString(12),
      iso: new Date().toISOString(),
      startDateString: startDateString,
      endDateString: endDateString,
      startTime: startTime,
      endTime: endTime,
      userId: props.user.id,
      description: description,
      groupId: props.group.id,
      notificationIds: notificationIds,
      custom: {},
      partners: [],
    };
    // create new invitaions
    const invitation = {
      activityId: newActivity.id,
      iso: new Date().toISOString(),
    };
    for (const uid of invitingUsers) {
      let userInvitaions = (await axios.get(`${config.api}/access-item`, {params: {
        table: 'Laijoig-Invitations',
        id: uid,
      }})).data.Item;
      userInvitaions = {
        id: props.user.id,
        invitations: userInvitaions ? [...userInvitaions.invitations, invitation] : [invitation],
      };
      await axios.post(`${config.api}/access-item`, {
        table: 'Laijoig-Invitations',
        data: userInvitaions,
      });
    }

    const fm = props.user.activityMonths[0] < startDateString ? props.user.activityMonths[0] : startDateString;
    const em = props.user.activityMonths[1] > endDateString ? props.user.activityMonths[1] : endDateString;
    const newUser = { ...props.user, activityMonths: [fm, em] };
    props.setUser(newUser);
    props.setActivities([...props.activities, newActivity]);
    // back to home page
    navigation.goBack();
    // store to database
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Activities',
      data: newActivity
    });
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Users',
      data: newUser
    });
    // send push notification to invited users
    for (const uid of invitingUsers) {
      const user = props.users.find(u => u.id === uid);
      await sendPushNotification(
        user.deviceToken,
        `${props.user.name}邀請你參加活動`,
        `${to12HourFormat(startTime)}-${to12HourFormat(endTime)} ${description}`,
        { 
          activityId: newActivity.id,
        }
      );
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={globalStyles.safeArea}>
          <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
            {/* toolbar */}
            <Toolbar text={'新增活動'}/>
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
                {/* <Text style={[styles.subtitle, { marginTop: 16 }]}>邀請 ( {invitingUsers.length} )</Text>
                <View style={[globalStyles.flexRow]}>
                  <Button text='邀請所有人' style={styles.allDayButton} textStyle={styles.allDayText}
                    onPress={() => setInvitingUsers(props.users.filter(u => u.id !== props.user.id).map(u => u.id))}
                  />
                </View>
                <ScrollView style={styles.usersList} nestedScrollEnabled={true}>
                  <Pressable>
                    {props.users.filter(u => u.id !== props.user.id).map((u, i) => {
                      const url = props.urls[u.id];
                      return (
                        <TouchableWithoutFeedback key={u.id} onPress={() => {
                          if (!invitingUsers.includes(u.id)) {
                            setInvitingUsers([...invitingUsers, u.id]);
                          } else {
                            setInvitingUsers(invitingUsers.filter(id => id !== u.id));
                          }
                        }}>
                          <View style={[invitingUsers.includes(u.id) ? styles.inviting : {}, styles.invitingUser, globalStyles.flexRow, globalStyles.alignItems.center]}>
                            <View style={[styles.taggingAvatar, { backgroundColor: u.color }]}>
                              {url ? <Image source={{ uri: url }} style={styles.taggingAvatarImage} /> : <Text style={styles.taggingAvatarText}>{u.name[0]}</Text>}
                            </View>
                            <View style={styles.taggingUserInfo}>
                              <Text style={styles.taggingUsername}>{u.name}</Text>
                              <Text style={styles.taggingUserId}>{u.id}</Text>
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      )
                    })}
                  </Pressable>
                </ScrollView> */}
                
                {/* margin bottom */}
                <View style={{ marginBottom: 76 }}/>

              </Pressable>
            </ScrollView>
            <View style={styles.buttonContainer}>
              <Button text='新增' style={[styles.saveButton, isValid() ? {} : styles.saveButtonDisabled]} textStyle={[styles.buttonText, isValid() ? {} : styles.disabledText]} onPress={handleSubmit}/>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
    fontWeight: 'bold',
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
    marginBottom: 8,
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
    marginVertical: 8,
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

  usersList: {
    height: 'auto',
    maxHeight: 160,
    borderWidth: .5,
    borderColor: '#ddd',
    borderRadius: 12,
  },
  invitingUser: {
    padding: 6,
    paddingHorizontal: 22,
  },
  inviting: {
    backgroundColor: globalStyles.colors.green + '44',
  },
  taggingAvatar: {
    width: 24,
    height: 24,
    borderRadius: 20,
    ...globalStyles.flexCenter,
  },
  taggingAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  taggingAvatarText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  taggingUserInfo: {
    marginLeft: 12,
  },
  taggingUsername: {
    fontWeight: 'bold',
  },
  taggingUserId: {
    fontSize: 12,
    color: '#888',
  },
});

export default CreateActivity