import { SafeAreaView, TouchableWithoutFeedback, Image, Keyboard, View, Text, StyleSheet, ScrollView, TouchableHighlight, TouchableNativeFeedback, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react';
import { globalStyles, urls, weekDays } from '../../utils/Constants';
import { useAppState } from '../../context/AppContext';
import { useProfileState } from '../../context/ProfileContext';
import { useUtilState } from '../../context/UtilContext';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { getAllMonthsBetween, getDateString, getDateStringsBetween, getTimeString, schedulePushNotification, sendPushNotification, to12HourFormat, uploadImage } from '../../utils/Functions';
import axios from 'axios';
import config from '../../../config.json';
import Activitiy from '../../components/Activitiy';
import Loading from '../../components/Loading';

const Overview = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useUtilState(), ...useProfileState(), ...route.params };
  const [showingInfo, setShowingInfo] = useState('schedule');
  const [activities, setActivities] = useState([]);
  const [splitedActivities, setSplitedActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [showingImage, setShowingImage] = useState(false);
  const [url, setUrl] = useState(props.urls[props.user.id]);

  // invitations
  const [answering, setAnswering] = useState(-1);
  const [answeringActivity, setAnsweringActivity] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (answering !== -1) {
      setAnsweringActivity(props.invitingActivities[answering]);
    } else {
      setAnsweringActivity(null);
    }
  }, [answering]);

  useEffect(() => {
    if (props.goToInvitations) {
      setShowingInfo('invitations');
    }
  }, [props.goToInvitations]);

  useEffect(() => {
    setUrl(props.urls[props.user.id]);
  }, [props.urls]);

  useEffect(() => {
    (async () => {
      const nowString = getDateString(new Date()).slice(0, 7);
      const activityMonths = props.user.activityMonths;
      const allMonths = getAllMonthsBetween(new Date(activityMonths[0]), new Date(activityMonths[1]));
      let newActivities = [];
      let newComments = [];
      for (const m of allMonths) {
        if (m < nowString) continue; 
        // load activities
        const activitiesRes = await axios.get(`${config.api}/access-items`, { params: {
          table: 'Laijoig-Activities',
          filter: 'dateRange',
          id: props.group.id,
          month: m,
        }});
        // load comments
        const commentsRes = await axios.get(`${config.api}/access-items`, { params: {
          table: 'Laijoig-Comments',
          filter: 'date',
          id: props.group.id,
          month: m
        }});
        // update
        newActivities = [ ...newActivities, ...activitiesRes.data ].filter(a => a.userId === props.user.id);
        newComments = [ ...newComments, ...commentsRes.data ];
      }
      setActivities(Array.from(new Set(newActivities.map(a => a.id))).map(id => newActivities.find(a => a.id === id)));
      setComments(Array.from(new Set(newComments.map(t => t.id))).map(id => newComments.find(t => t.id === id)));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const newActivities = [];
    for (const activity of activities) {
      if (activity.startDateString === activity.endDateString) {
        newActivities.push(activity);
        continue;
      }
      const allDates = getDateStringsBetween(activity.startDateString, activity.endDateString);
      for (const d of allDates) {
        const custom = activity.custom[d];
        if (custom?.delete) continue;
        const newActivity = { 
          ...activity, 
          startDateString: d, 
          endDateString: d, 
          iso: custom?.iso || activity.iso,
          startTime: custom?.startTime || activity.startTime,
          endTime: custom?.endTime || activity.endTime,
          description: custom?.description || activity.description,
        };
        newActivities.push(newActivity);
      }
    }
    const now = new Date();
    setSplitedActivities(newActivities.filter(a => a.startDateString > getDateString(new Date()) || (a.startDateString === getDateString(now) && a.startTime >= getTimeString(now)))
      .sort((a, b) => {
        if (a.startDateString !== b.startDateString) return a.startDateString < b.startDateString ? -1 : 1;
        if (a.startTime !== b.startTime) return a.startTime < b.startTime ? -1 : 1;
        if (a.endTime !== b.endTime) return a.endTime < b.endTime ? -1 : 1;
        return a.iso < b.iso ? -1 : 1;
      }));
  }, [activities]);

  // hide image window
  useEffect(() => {
    setShowingImage(false);
  }, [props.trigger]);

  const handleClick = (item) => {
    if (item === 'bg') {
      setShowingImage(false);
      setAnswering(-1);
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const extension = result.assets[0].uri.slice(result.assets[0].uri.length - 4).replace('.', '');
      const url = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setUrl(url);
      props.setUrls({ ...props.urls, [props.user.id]: url });
      // upload to database
      const newUser = { ...props.user, url: `${props.user.id}.${extension}` };
      await axios.post(`${config.api}/access-item`, { table: 'Laijoig-Users', data: newUser });
      await uploadImage('laijoig-bucket', `${props.user.id}.${extension}`, url);
    }
  }

  // reject invitation
  const rejectActivity = async () => {
    const activity = { ...answeringActivity };
    const newInvitations = { 
      ...props.invitations, 
      invitations: props.invitations.invitations.filter(i => i.activityId !== activity.id) 
    };
    props.setInvitations(newInvitations);
    props.setInvitingActivities(props.invitingActivities.filter(a => a.id !== activity.id));
    setAnswering(-1);
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Invitations',
      data: newInvitations,
    });
    // send notification to inviter
    const inviter = props.users.find(u => u.id === activity.userId);
    await sendPushNotification(
      inviter.deviceToken,
      `${props.user.name}拒絕了你的邀請`,
      `${to12HourFormat(activity.startTime)}-${to12HourFormat(activity.endTime)} ${activity.description}`,
      {}
    );
  }

  // accept invitation
  const joinActivity = async () => {
    let activity = { ...answeringActivity };
    // schedule notification
    const notificationIds = [];
    const dates = getDateStringsBetween(activity.startDateString, activity.endDateString);
    for (const d of dates) {
      const notificationId = await schedulePushNotification(d, activity.startTime, `${props.user.name}${to12HourFormat(activity.startTime)}有一項活動`, activity.description, 30);
      notificationIds.push({ dateString: d, id: notificationId });
    }
    // become a partner
    activity = { 
      ...activity,
      partners: [
        ...activity.partners, 
        { userId: props.user.id, notificationIds: notificationIds },
      ],
    };
    // remove invitation from database
    const newInvitations = { 
      ...props.invitations, 
      invitations: props.invitations.invitations.filter(i => i.activityId !== activity.id) 
    };
    props.setInvitations(newInvitations);
    props.setInvitingActivities(props.invitingActivities.filter(a => a.id !== activity.id));
    setAnswering(-1);
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Invitations',
      data: newInvitations,
    });
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Activities',
      data: activity
    });
    // send notification to inviter
    const inviter = props.users.find(u => u.id === activity.userId);
    await sendPushNotification(
      inviter.deviceToken,
      `${props.user.name}接受了你的邀請`,
      `${to12HourFormat(activity.startTime)}-${to12HourFormat(activity.endTime)} ${activity.description}`,
      {}
    );
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={[globalStyles.safeArea, globalStyles.flex1]}>
          <View style={[styles.topRow, globalStyles.flexRow, globalStyles.alignItems.center, globalStyles.justifyContent.flexEnd]}>
            <Button icon={<Icon name='menu-outline' style={styles.menuIcon}/>} onPress={() => navigation.navigate('Settings')}/>
          </View>
          <View style={[styles.body, globalStyles.flex1]}>
            {/* profile view */}
            <View style={styles.profileView}>
              {/* avatar & username */}
              <View style={[styles.userInfoRow, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <TouchableWithoutFeedback onPress={() => setShowingImage(true)}>
                  <View style={[styles.avatar, globalStyles.flexCenter, { backgroundColor: props.user.color }]}>
                    {url ? <Image style={styles.avatarImage} source={{ uri: url }}/> : <Text style={styles.avatarText}>{props.user.name[0]}</Text>}
                  </View>
                </TouchableWithoutFeedback>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{props.user.name}</Text>
                  <Text style={styles.id}>@{props.user.id}</Text>
                </View>
              </View>
              <View style={styles.aboutMe}>
                <Text style={styles.aboutMeTitle}>{props.user.title}</Text>
                <Text style={styles.aboutMeText}>{props.user.aboutMe}</Text>
              </View>
            </View>
            {/* groups list */}
            {/* <ScrollView horizontal style={[styles.groupsList]}>
              {props.groups.map((group, i) => {
                return (
                  <Pressable key={group.id}>
                    <Button text={'行程'} style={[styles.groupButton, group.id === selectedGroup ? { borderBottomColor: '#000' } : {}]} onPress={() => setSelectedGroup(group.id)}/>
                  </Pressable>
                )
              })}
            </ScrollView> */}
            <View style={[globalStyles.flexRow, styles.groupsList]}>
              <Button text={'行程'} style={[styles.groupButton, showingInfo === 'schedule' ? { borderBottomColor: '#000' } : {}]} onPress={() => setShowingInfo('schedule')}/>
              {/* <Button text={'邀請'} style={[styles.groupButton, showingInfo === 'invitations' ? { borderBottomColor: '#000' } : {}]} onPress={() => setShowingInfo('invitations')}/> */}
            </View>
            {/* list */}
            {showingInfo === 'invitations' ? 
              props.invitingActivities.length > 0 ? <ScrollView style={[globalStyles.flex1, styles.invitationsList]}>
                {props.invitingActivities.map((activity, i) => {
                  const sender = props.users.find(u => u.id === activity.userId);
                  return (
                    <View key={props.invitations.invitations[i]?.iso}>
                      <TouchableNativeFeedback onPress={() => setAnswering(i)}>
                        <View style={[styles.invitation, i === props.invitingActivities.length - 1 ? { borderBottomColor: 'transparent' } : {}]}>
                          <Text style={styles.invitationTitle}>{sender.name}邀請你參加活動</Text>
                          <Text style={styles.invitationTime}>{activity.startDateString.replaceAll('-', ' / ')} {weekDays[new Date(activity.startDateString).getDay()]}{activity.startDateString === activity.endDateString ? '' : ` - ${activity.endDateString.replaceAll('-', ' / ')} ${weekDays[new Date(activity.endDateString).getDay()]}`}</Text>
                          <Text style={styles.invitationTime}>{to12HourFormat(activity.startTime)} - {to12HourFormat(activity.endTime)}</Text>
                          <Text style={styles.invitationMessage} numberOfLines={1} ellipsizeMode='tail'>{activity.description}</Text>
                        </View>
                      </TouchableNativeFeedback>
                    </View>
                  )
                })}
              </ScrollView>
              : 
              // empty
              <View style={[styles.empty, globalStyles.flexCenter]}>
                <Text style={styles.emptyText}>沒有邀請</Text>
              </View>
            : showingInfo === 'schedule' ?
              splitedActivities.length > 0 ? <ScrollView style={[globalStyles.flex1, styles.activitiesList]}>
                {splitedActivities.map((activity, i) => {
                  const activityProps = {
                    selectedDate: new Date(activity.startDateString),
                    comments: comments,
                  };
                  return (
                    <View style={[styles.activityContainer, i === 0 ? { marginTop: 0 } : {}]}>
                      <Activitiy 
                        { ...props } 
                        { ...activityProps } 
                        activity={activity} 
                        showDate
                      />
                    </View>
                  )
                })}
              </ScrollView>
              : 
              // empty
              <View style={[styles.empty, globalStyles.flexCenter]}>
                {loading ? <Loading/> : <Text style={styles.emptyText}>沒有行程</Text>}
              </View>
            : <></>}
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
      {/* show image */}
      {showingImage && 
      <TouchableWithoutFeedback onPress={() => handleClick('bg')}>
        <View style={styles.imageWindow}>
          <TouchableWithoutFeedback onPress={pickImage}>
            <View style={[styles.avatar, styles.imageAvatar, globalStyles.flexCenter, { backgroundColor: props.user.color }]}>
              {url ? <Image style={styles.avatarImage} source={{ uri: url }}/> : <Text style={[styles.avatarText, styles.imageAvatarText]}>{props.user.name[0]}</Text>}
            </View>
          </TouchableWithoutFeedback>
          <Button onPress={pickImage} style={styles.imageButton} textStyle={styles.imageButtonText} icon={<FeatherIcon name='image' size={22}/>} text={'變更照片'}/>
        </View>
      </TouchableWithoutFeedback>}
      {/* answer an invitation */}
      {answeringActivity && 
      <TouchableWithoutFeedback onPress={() => handleClick('bg')}>
        <View style={styles.dialogContainer}>
          <TouchableWithoutFeedback onPress={() => handleClick('window')}>
            <View style={styles.dialog}>
              <View style={styles.dialogBody}>
                <Text style={styles.dialogTitle}>{props.users.find(u => u.id === answeringActivity.userId).name}邀請你參加活動</Text>
                <Text style={styles.dialogTextSmall}>{answeringActivity.startDateString.replaceAll('-', ' / ')} {weekDays[new Date(answeringActivity.startDateString).getDay()]}{answeringActivity.startDateString === answeringActivity.endDateString ? '' : ` - ${answeringActivity.endDateString.replaceAll('-', ' / ')} ${weekDays[new Date(answeringActivity.endDateString).getDay()]}`}</Text>
                <Text style={styles.dialogTextSmall}>{to12HourFormat(answeringActivity.startTime)} - {to12HourFormat(answeringActivity.endTime)}</Text>
                <ScrollView style={styles.dialogTextContainer}>
                  <Pressable>
                    <Text style={styles.dialogText}>{answeringActivity.description}</Text>
                  </Pressable>
                </ScrollView>
              </View>
              <View style={{ height: .5, backgroundColor: '#ccc' }}/>
              <View style={[globalStyles.flexRow]}>
                <Button style={[styles.dialogButton, globalStyles.flex1]} text={'拒絕'} textStyle={{ fontWeight: 'bold', color: globalStyles.colors.red }}
                  onPress={rejectActivity}
                />
                <View style={{ width: .5, backgroundColor: '#ccc' }}/>
                <Button style={[styles.dialogButton, globalStyles.flex1]} text={'參加'} textStyle={{ fontWeight: 'bold', color: globalStyles.colors.green }}
                  onPress={joinActivity}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topRow: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  settingIcon: {
    width: 24,
    height: 24,
    padding: 2,
    marginRight: 16,
    marginVertical: 6,
  },
  settingIconImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    backgroundColor: '#fff',
  },
  profileView: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  menuIcon: {
    fontSize: 28,
    padding: 2,
  },
  userInfoRow: {
    padding: 8,
  },
  avatar: {
    width: '22%',
    aspectRatio: '1/1',
    borderRadius: 50,
    marginHorizontal: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 20,
  },
  userInfo: {
    marginLeft: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  id: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },
  aboutMe: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  aboutMeTitle: {
    color: '#888',
  },
  aboutMeText: {
    marginTop: 8,
  },
  groupsList: {
    // borderBottomWidth: 1,
    // borderBottomColor: '#ddd',
    marginLeft: 16,
  },
  groupButton: {
    // width: 90,
    margin: 4,
    padding: 8,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    ...globalStyles.flexCenter,
  },
  empty: {
    flex: 1,
  },
  emptyText: {
    color: '#aaa',
  },

  imageWindow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
    backgroundColor: '#fff',
  },
  imageAvatar: {
    borderRadius: 200,
    width: '72%',
    aspectRatio: '1/1',
  },
  imageAvatarText: {
    fontSize: 64,
  },
  imageButton: {
    marginTop: 32,
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  imageButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  activitiesList: {
    marginTop: 8,
    paddingHorizontal: 12,
  },
  activityContainer: {
    marginTop: 16,
    marginBottom: 4,
  },

  invitationsList: {
    paddingHorizontal: 12,
    marginTop: 8,
  },
  invitation: {
    width: '100%',
    padding: 8,
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: .5,
  },
  invitationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  invitationTime: {
    marginTop: 4,
    fontSize: 12,
  },
  invitationMessage: {
    marginTop: 8,
  },

  dialogContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: .4,
    shadowRadius: 8,
  },
  dialog: {
    borderRadius: 16,
    width: '80%',
    backgroundColor: '#fff',
    elevation: 4,
  },
  dialogBody: {
    padding: 12,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dialogTextSmall: {
    fontSize: 13,
    marginTop: 8,
  },
  dialogTextContainer: {
    maxHeight: 256,
    marginVertical: 8,
  },
  dialogText: {
    marginTop: 8,
  },
  dialogButton: {
    paddingVertical: 12,
  },
});

export default Overview