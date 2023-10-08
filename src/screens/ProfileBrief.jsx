import { SafeAreaView, TouchableWithoutFeedback, Image, Keyboard, View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react';
import { globalStyles, urls } from '../utils/Constants';
import { useAppState } from '../context/AppContext';
import { useProfileState } from '../context/ProfileContext';
import { useUtilState } from '../context/UtilContext';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import config from '../../config.json';
import Toolbar from '../components/Toolbar';
import { getAllMonthsBetween, getDateStringsBetween, getTimeString, getDateString } from '../utils/Functions';
import Activitiy from '../components/Activitiy';
import Loading from '../components/Loading';

const ProfileBrief = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useUtilState(), ...route.params };
  const [user, setUser] = useState(props.briefUser);
  const [showingInfo, setShowingInfo] = useState('schedule');
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [splitedActivities, setSplitedActivities] = useState([]);
  const [showingImage, setShowingImage] = useState(false);
  const [url, setUrl] = useState(props.urls[user.id]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUrl(props.urls[user.id]);
  }, [props.urls]);
  
  useEffect(() => {
    (async () => {
      const nowString = getDateString(new Date()).slice(0, 7);
      const activityMonths = user.activityMonths;
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
        newActivities = [ ...newActivities, ...activitiesRes.data ].filter(a => a.userId === user.id);
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

  const handleImageClick = (item) => {
    if (item === 'bg') {
      setShowingImage(false);
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={[globalStyles.safeArea, globalStyles.flex1]}>
          <View style={[styles.body, globalStyles.flex1]}>
            <Toolbar text={''}/>
            {/* profile view */}
            <View style={styles.profileView}>
              {/* avatar & username */}
              <View style={[styles.userInfoRow, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <TouchableWithoutFeedback onPress={() => setShowingImage(true)}>
                  <View style={[styles.avatar, globalStyles.flexCenter, { backgroundColor: user.color }]}>
                    {url ? <Image style={styles.avatarImage} source={{ uri: url }}/> : <Text style={styles.avatarText}>{user.name[0]}</Text>}
                  </View>
                </TouchableWithoutFeedback>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{user.name}</Text>
                  <Text style={styles.id}>@{user.id}</Text>
                </View>
              </View>
              <View style={styles.aboutMe}>
                <Text style={styles.aboutMeTitle}>{user.title}</Text>
                <Text style={styles.aboutMeText}>{user.aboutMe}</Text>
              </View>
            </View>
            <View style={[globalStyles.flexRow, styles.groupsList]}>
              {/* <Button text={'朋友'} style={[styles.groupButton, showingInfo === 'friends' ? { borderBottomColor: '#000' } : {}]} onPress={() => setShowingInfo('friends')}/> */}
              <Button text={'行程'} style={[styles.groupButton, showingInfo === 'schedule' ? { borderBottomColor: '#000' } : {}]} onPress={() => setShowingInfo('schedule')}/>
            </View>
            {/* list */}
            {showingInfo === 'friends' ? 
              users.length > 1 ? <></>
              : 
              // empty
              <View style={[styles.empty, globalStyles.flexCenter]}>
                <Text style={styles.emptyText}>沒有朋友</Text>
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
      <TouchableWithoutFeedback onPress={() => handleImageClick('bg')}>
        <View style={styles.imageWindow}>
          <View style={[styles.avatar, styles.imageAvatar, globalStyles.flexCenter, { backgroundColor: user.color }]}>
            {url ? <Image style={styles.avatarImage} source={{ uri: url }}/> : <Text style={[styles.avatarText, styles.imageAvatarText]}>{user.name[0]}</Text>}
          </View>
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
});

export default ProfileBrief