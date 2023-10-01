import { SafeAreaView, Pressable, TouchableWithoutFeedback, Image, Keyboard, View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react';
import { globalStyles, urls } from '../../utils/Constants';
import { useAppState } from '../../context/AppContext';
import { useProfileState } from '../../context/ProfileContext';
import { useUtilState } from '../../context/UtilContext';
import Topbar from '../../components/Topbar';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';

const Overview = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useUtilState(), ...useProfileState() };
  const [showingInfo, setShowingInfo] = useState('schedule');
  const [activities, setActivities] = useState([]);
  // top buttons
  const topButtons = [
    // setting
    <Button 
      icon={<View style={styles.settingIcon}>
        <Image source={urls.settings} style={styles.settingIconImage}/>
      </View>}
      onPress={() => navigation.navigate('Settings')}
    />
  ];


  return (
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
              <View style={[styles.avatar, globalStyles.flexCenter, { backgroundColor: props.user.color }]}>
                <Text style={styles.avatarText}>{props.user.name[0]}</Text>
              </View>
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
            {/* <Button text={'朋友'} style={[styles.groupButton, showingInfo === 'friends' ? { borderBottomColor: '#000' } : {}]} onPress={() => setShowingInfo('friends')}/> */}
            <Button text={'行程'} style={[styles.groupButton, showingInfo === 'schedule' ? { borderBottomColor: '#000' } : {}]} onPress={() => setShowingInfo('schedule')}/>
          </View>
          {/* list */}
          {showingInfo === 'friends' ? 
            props.users.length > 1 ? <></>
            : 
            // empty
            <View style={[styles.empty, globalStyles.flexCenter]}>
              <Text style={styles.emptyText}>沒有朋友</Text>
            </View>
          : showingInfo === 'schedule' ?
            activities.length > 0 ? <></>
            : 
            // empty
            <View style={[styles.empty, globalStyles.flexCenter]}>
              <Text style={styles.emptyText}>沒有行程</Text>
            </View>
          : <></>}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
});

export default Overview