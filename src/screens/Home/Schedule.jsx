import { View, Text, Image, TextInput, StyleSheet, Pressable, ScrollView, TouchableWithoutFeedback, SafeAreaView, FlatList, Dimensions } from 'react-native'
import { useFonts } from 'expo-font';
import React, { useState, useEffect, useRef } from 'react';
import Calendar from '../../components/Calendar';
import ActivityList from '../../components/ActivityList';
import { useHomeState } from '../../context/HomeContext';
import { useUtilState } from '../../context/UtilContext';
import { useAppState } from '../../context/AppContext';
import axios from 'axios';
import { config } from '../../utils/config';
import { getDateString, getRandomString } from '../../utils/Functions';
import { globalStyles } from '../../utils/Constants';
import Button from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from '@expo/vector-icons';

const screenWidth = Dimensions.get('screen').width;

const Schedule = ({ navigation, route }) => {
  let [fontsLoaded] = useFonts({
    'Logo': require('../../../assets/fonts/OnelySans.ttf')
  });

  const flatListRef = useRef(null);
  const props = { ...useUtilState(), ...useAppState(), ...useHomeState(), ...route.params };
  const [calendarData, setCalendarData] = useState([]);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [invitingUsers, setInvitingUsers] = useState([]);
  const [selectingUsers, setSelectingUsers] = useState([]);
  // state
  const [loading, setLoading] = useState(true);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [changingGroup, setChangingGroup] = useState(false);
  const [addingGroup, setAddingGroup] = useState(false);
  const [inviting, setInviting] = useState(false);

  // initial calendar data
  useEffect(() => {
    const calendarData = [];
    const currentDate = new Date(props.month);
    for (let i = -1; i <= 1; i++) {
      const date = new Date(props.month);
      date.setMonth(currentDate.getMonth() + i);
      calendarData.push({ key: i, date: date });
    }
    setCalendarData(calendarData);
  }, []);

  useEffect(() => {
    if (calendarData.length > 2) {
      flatListRef.current.scrollToIndex({ index: 1, animated: false })
    }
  }, [calendarData]);

  // go to full calendar mode
  useEffect(() => {
    if (props.isDoubleClick) {
      console.log('double click')
      props.setIsDoubleClick(false);
      navigation.replace('FullCalendar');
      (async () => {
        await AsyncStorage.setItem('calendarFormat', 'full');
      })();
    }
  }, [props.isDoubleClick]);

  // initial load activities
  useEffect(() => {
    (async () => {
      // load activities
      const activitiesRes = await axios.get(`${config.api.general}/access-items`, { params: {
        table: 'Laijoig-Activities',
        filter: 'dateRange',
        id: props.group.id,
        month: getDateString(props.month).slice(0, 7),
      }});
      // load comments
      const commentsRes = await axios.get(`${config.api.general}/access-items`, { params: {
        table: 'Laijoig-Comments',
        filter: 'date',
        id: props.group.id,
        month: getDateString(props.month).slice(0, 7)
      }});
      props.setActivities(activitiesRes.data);
      props.setComments(commentsRes.data);
      props.setLoaded([getDateString(props.month).slice(0, 7)]);
      setLoading(false);
    })();
    // set not invited people
    setInvitingUsers(props.users.filter(u => !props.group.members.includes(u.id)));
  }, [props.group]);

  useEffect(() => {
    // handle data
    if (route?.params?.date) {
      props.setSelectedDate(route.params.date);
    }
    if (route?.params?.toActivity) {
      navigation.navigate('Comments', { activity: route.params.toActivity });
    }
  }, [route]);

  // reload data
  useEffect(() => {
    (async () => {
      setLoading(true);
      // load activities
      const activitiesRes = await axios.get(`${config.api.general}/access-items`, { params: {
        table: 'Laijoig-Activities',
        filter: 'dateRange',
        id: props.group.id,
        month: getDateString(props.month).slice(0, 7),
      }});
      // load comments
      const commentsRes = await axios.get(`${config.api.general}/access-items`, { params: {
        table: 'Laijoig-Comments',
        filter: 'date',
        id: props.group.id,
        month: getDateString(props.month).slice(0, 7)
      }});
      const compatActivities = [ ...props.activities, ...activitiesRes.data ];
      const compatComments = [ ...props.comments, ...commentsRes.data ];
      props.setActivities(Array.from(new Set(compatActivities.map(a => a.id))).map(id => compatActivities.find(a => a.id === id)));
      props.setComments(Array.from(new Set(compatComments.map(t => t.id))).map(id => compatComments.find(t => t.id === id)));
      setLoading(false);
    })();
  }, [props.trigger]);
  
  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    if (x % screenWidth !== 0 || !scrollEnabled) return;
    const newData = [...calendarData];
    setScrollEnabled(false);
    setTimeout(() => setScrollEnabled(true), 100);
    if (x <= 0) {
      const date = new Date(newData[0].date);
      date.setMonth(date.getMonth() - 1);
      newData.unshift({ key: newData[0].key - 1, date: date });
      newData.pop();
      props.setMonth(newData[1].date);
    } else if (x >= screenWidth * 2) {
      const date = new Date(newData[2].date);
      date.setMonth(date.getMonth() + 1);
      newData.push({ key: newData[2].key + 1, date: date });
      newData.shift();
      props.setMonth(newData[1].date);
    }
    setCalendarData(newData);
  }

  const handleClick = (element) => {
    if (element === 'background') {
      setChangingGroup(false);
    } else if (element === 'addingBackground') {
      setAddingGroup(false);
    } else if (element === 'invitingBackground') {
      setInviting(false);
    }
  }

  const createGroup = async () => {
    const newGroup = {
      id: getRandomString(12),
      name: newCalendarName,
      members: [props.user.id],
      iso: new Date().toISOString(),
      lastSender: '',
      lastMessage: '',
      lastTime: '',
      url: '',
    };
    setAddingGroup(false);
    setChangingGroup(false);
    props.setGroup(newGroup);
    props.setGroups([...props.groups, newGroup]);
    // update user
    const newUser = { ...props.user, groups: [...props.user.groups, newGroup.id] };
    props.setUser(newUser);
    props.setUsers(props.users.map(u => u.id === newUser.id ? newUser : u));
    await axios.post(`${config.api.general}/access-item`, {
      table: 'Laijoig-Groups',
      data: newGroup
    });
    await axios.post(`${config.api.general}/access-item`, {
      table: 'Laijoig-Users',
      data: newUser
    });
  }

  const addUsers = async () => {
    const newGroup = { ...props.group, members: [...props.group.members, ...selectingUsers.map(u => u.id)] };
    props.setGroup(newGroup);
    props.setGroups(props.groups.map(g => g.id === newGroup.id ? newGroup : g));
    setInviting(false);
    axios.post(`${config.api.general}/access-item`, {
      table: 'Laijoig-Groups',
      data: newGroup
    });
    let newUsers = [ ...props.users ];
    for (const user of selectingUsers) {
      const newUser = { ...user, groups: [...user.groups, newGroup.id] };
      newUsers = newUsers.map(u => u.id === newUser.id ? newUser : u);
      axios.post(`${config.api.general}/access-item`, {
        table: 'Laijoig-Users',
        data: newUser
      });
    }
    props.setUsers(newUsers);
  }

  const renderCalendar = ({ item }) => (
    <View style={styles.calendarContainer}>
      <Calendar { ...props } loading={loading} setLoading={setLoading} month={item.date}/>
    </View>
  )

  return (
    <>
      <SafeAreaView style={[styles.container, globalStyles.safeArea]}>
        <View style={[styles.logobar, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween]}>
          <View style={[globalStyles.flexRow]}>
            <View style={styles.logoImageContainer}>
              <Image style={styles.logoImage} source={require('../../../assets/images/logo.png')}/>
            </View>
            <Text style={{ ...styles.logoText, fontFamily: fontsLoaded ? 'Logo' : '' }}>Laijoig</Text>
          </View>
        </View>
        <View style={styles.shadowContainer}>
          <View style={styles.body}>
            <FlatList
              ref={flatListRef}
              style={styles.flatList}
              data={calendarData}
              horizontal
              showsHorizontalScrollIndicator={false}
              onContentSizeChange={() => {
                flatListRef.current.scrollToIndex({ index: 1, animated: false })
              }}
              onScrollToIndexFailed={() => {}}
              decelerationRate="fast"
              snapToAlignment="start"
              snapToInterval={screenWidth}
              keyExtractor={item => item.key.toString()}
              renderItem={renderCalendar}
              onScroll={handleScroll}
            />
            <ActivityList { ...props } loading={loading} setLoading={setLoading} />
          </View>
        </View>
      </SafeAreaView>

      {/* groups list */}
      {changingGroup &&
      <TouchableWithoutFeedback onPress={() => handleClick('background')}>
        <View style={styles.popupContainer}>
          <View style={styles.popupContainerShadow}>
            <View style={[styles.popup, { height: 49 * (props.groups.length + 1) }]}>
              <ScrollView>
                <Pressable>
                  {props.groups.map((group, i) => {
                    return (
                      <TouchableWithoutFeedback key={`group-${i}`} onPress={() => {
                        props.setGroup(group);
                        setChangingGroup(false);
                      }}>
                        <View style={[styles.group, { borderBottomColor: '#ddd', borderBottomWidth: .5 }]}>
                          <Text>{group.name}</Text>
                        </View>
                      </TouchableWithoutFeedback>
                    )
                  })}
                  <TouchableWithoutFeedback onPress={() => setAddingGroup(true)}>
                    <View style={styles.group}>
                      <Text style={{ fontWeight: 'bold' }}>新增日曆</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>}

      {/* name input */}
      {addingGroup &&
      <TouchableWithoutFeedback onPress={() => handleClick('addingBackground')}>
        <View style={styles.popupContainer}>
          <View style={styles.popupContainerShadow}>
            <View style={[styles.addingPopup]}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4, }}>日曆名稱</Text>
              <TextInput placeholder='名稱' style={styles.input} value={newCalendarName} onChangeText={text => setNewCalendarName(text)}/>
              <View style={[globalStyles.flexRow, globalStyles.justifyContent.flexEnd, { marginTop: 16 }]}>
                <Button text={'建立'} style={styles.button} textStyle={{ fontWeight: 'bold', color: '#fff' }} onPress={createGroup}/>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>}

      {/* invite people */}
      {inviting &&
      <TouchableWithoutFeedback onPress={() => handleClick('invitingBackground')}>
        <View style={styles.popupContainer}>
          <View style={styles.popupContainerShadow}>
            <View style={[styles.popup, { height: 49 * (invitingUsers.length + 1) }]}>
              <ScrollView>
                <Pressable>
                  <Text style={{ fontWeight: 'bold', margin: 12, }}>成員</Text>
                  {props.group.members.map((uid, i) => {
                    const user = props.users.find(u => u.id === uid);
                    const url = props.urls[user.id];
                    return (
                      <TouchableWithoutFeedback key={`user-${i}`} onPress={() => {
                        // remove
                      }}>
                        <View style={[styles.user, globalStyles.flexRow, globalStyles.alignItems.center, { backgroundColor: selectingUsers.find(u => u.id === user.id) ? globalStyles.colors.green + '44' : '#fff' }]}>
                          <View style={[styles.avatar, { backgroundColor: user.color }]}>
                            {url ? <Image source={{ uri: url }} style={styles.userImage} /> : <Text style={styles.userImageText}>{user.name[0]}</Text>}
                          </View>
                          <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userId}>{user.id}</Text>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    )
                  })}
                  <Text style={{ fontWeight: 'bold', margin: 12, }}>新增</Text>
                  {invitingUsers.map((user, i) => {
                    const url = props.urls[user.id];
                    return (
                      <TouchableWithoutFeedback key={`user-${i}`} onPress={() => {
                        if (selectingUsers.find(u => u.id === user.id)) {
                          setSelectingUsers(selectingUsers.filter(u => u.id !== user.id));
                        } else {
                          setSelectingUsers([...selectingUsers, user]);
                        }
                      }}>
                        <View style={[styles.user, globalStyles.flexRow, globalStyles.alignItems.center, { backgroundColor: selectingUsers.find(u => u.id === user.id) ? globalStyles.colors.green + '44' : '#fff' }]}>
                          <View style={[styles.avatar, { backgroundColor: user.color }]}>
                            {url ? <Image source={{ uri: url }} style={styles.userImage} /> : <Text style={styles.userImageText}>{user.name[0]}</Text>}
                          </View>
                          <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userId}>{user.id}</Text>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    )
                  })}
                  <TouchableWithoutFeedback onPress={addUsers}>
                    <View style={styles.group}>
                      <Text style={{ fontWeight: 'bold' }}>新增成員</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>}

    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  logobar: {
    width: '100%',
    height: 56,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoImageContainer: {
    height: 26,
    aspectRatio: '1/1',
    marginRight: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    color: globalStyles.colors.primary,
    fontSize: 24,
  },
  shadowContainer: {
    flex: 1,
    shadowColor: '#171717',
    shadowOffset: { width: -1, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  body: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 3,
    flex: 1,
  },
  flatList: {
    flexGrow: 0
  },
  calendarContainer: {
    width: screenWidth,
    flexGrow: 1,
  },

  popupContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
  },
  popupContainerShadow: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: .3,
    shadowRadius: 5,
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
  },
  popup: {
    width: '72%',
    maxHeight: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  group: {
    paddingHorizontal: 16,
    height: 48,
    ...globalStyles.flexCenter,
  },

  addingPopup: {
    padding: 12,
    backgroundColor: '#fff',
    width: '64%',
    borderRadius: 16,
  },
  input: {
    marginTop: 4,
    padding: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
  },
  button: {
    backgroundColor: globalStyles.colors.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  inviteButton: {
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  user: {
    padding: 6,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 20,
    ...globalStyles.flexCenter,
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  userImageText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontWeight: 'bold',
  },
  userId: {
    fontSize: 12,
    color: '#888',
  },
});

export default Schedule