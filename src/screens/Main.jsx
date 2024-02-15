import React, { useEffect } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Schedule, CreateActivity } from "../../src";
import { View, StyleSheet, Image, Platform } from "react-native";
import { globalStyles, urls } from "../../src/utils/Constants";
import { HomeStateProvider } from "../../src/context/HomeContext";
import Comments from "../../src/screens/Comments";
import { ProfileStateProvider } from "../context/ProfileContext";
import Overview from "./Profile/Overview";
import { useUtilState } from "../context/UtilContext";
import { useAppState } from "../context/AppContext";
import Settings from "./Profile/Settings";
import axios from "axios";
import config from '../../config.json';
import ProfileSettings from "./Profile/ProfileSettings";
import NotificationsScreen from "./Profile/Notifications";
import Account from "./Profile/Account";
import Preference from "./Profile/Preference";
import ProfileBrief from "./ProfileBrief";
import EditActivity from "./Home/EditActivity";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FullScreenCalendar from "./Home/FullScreenCalendar";
import FullScreenCalendarDay from "./Home/FullScreenCalendarDay";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// home screen
const Home = ({ navigation, route }) => {

  return (
    <HomeStateProvider>
      <Stack.Navigator initialRouteName={'Schedule'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Schedule' component={Schedule} />
        <Stack.Screen name='CreateActivity' component={CreateActivity} />
        <Stack.Screen name='EditActivity' component={EditActivity}/>
        <Stack.Screen name="Comments" component={Comments} />
        <Stack.Screen name="ProfileBrief" component={ProfileBrief} />
        <Stack.Screen name='FullScreenCalendar' component={FullScreenCalendar} />
        <Stack.Screen name='FullScreenCalendarDay' component={FullScreenCalendarDay} />
      </Stack.Navigator>
    </HomeStateProvider>
  )
}

// notifications screen
const Notifications = () => {
  return (
    <HomeStateProvider>
      <Stack.Navigator initialRouteName="NotificationsScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen}/>
        <Stack.Screen name="Comments" component={Comments} />
      </Stack.Navigator>
    </HomeStateProvider>
  )
}

// profile screen
const Profile = ({ navigation, route }) => {

  const toSplash = route.params.toSplash;

  return (
    <ProfileStateProvider>
      <Stack.Navigator initialRouteName="Overview" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Overview" component={Overview}/>
        <Stack.Screen name="ProfileBrief" component={ProfileBrief} />
        <Stack.Screen name="Comments" component={Comments} />
        <Stack.Screen name="Settings" component={Settings} initialParams={{ toSplash: toSplash }} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="Account" component={Account} />
        <Stack.Screen name='EditActivity' component={EditActivity}/>
        <Stack.Screen name="Preference" component={Preference} />
      </Stack.Navigator>
    </ProfileStateProvider>
  )
}

// main page
const Main = ({ navigation, route }) => {

  const props = { ...useUtilState(), ...useAppState() };

  useEffect(() => {
    async function loadGroups() {
      const newGroups = [];
      for (const id of props.user.groups) {
        const res = (await axios.get(`${config.api}/access-item`, {
          params: {
            table: 'Laijoig-Groups',
            id: id,
          }
        })).data.Item;
        newGroups.push(res);
      }
      props.setGroups(newGroups);
    }
    if (props.user) {
      loadGroups();
    }
  }, [props.user]);

  // navigate to pages
  useEffect(() => {
    if (props.goToNotifications) {
      navigation.navigate('Notifications');
    } else if (props.goToInvitations) {
      navigation.navigate('Profile');
    }
  }, [props.goToNotifications, props.goToInvitations]);

  const toSplash = () => {
    navigation.replace('Splash');
  }

  // click home button
  const handleClickHome = () => {
    const time = new Date().getTime();
    if (props.lastClickTime) {
      const delta = time - props.lastClickTime;
      props.setIsDoubleClick(delta < 300); // is double click
      props.setLastClickTime(null);
    }
    props.setTrigger(!props.trigger);
    props.setLastClickTime(time);
  }

  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        borderTopWidth: 0,
      },
      tabBarHideOnKeyboard: Platform.OS === 'android',
    }}>
      {/* home */}
      <Tab.Screen name="Home" component={Home} options={{
        tabBarIcon: ({ focused }) => (
          <Icon name="home" size={26} color={focused ? globalStyles.colors.primary : '#000'} />
        ),
      }} listeners={({ navigation, route }) => ({
        tabPress: () => handleClickHome()
      })} />
      {/* notifications */}
      <Tab.Screen name="Notifications" component={Notifications} options={{
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconStyle}>
            <Image source={focused ? urls.bellSelected : urls.bell} style={styles.imageStyle} />
          </View>
        ),
      }} listeners={({ navigation, route }) => ({
        tabPress: () => props.setTrigger(!props.trigger)
      })} />
      {/* profile */}
      <Tab.Screen name="Profile" component={Profile} initialParams={{ toSplash: toSplash }} options={{
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconStyle}>
            <Image source={focused ? urls.userSelected : urls.user} style={styles.imageStyle} />
          </View>
        ),
      }} listeners={({ navigation, route }) => ({
        tabPress: () => props.setTrigger(!props.trigger)
      })} />
    </Tab.Navigator>
  )
}


const styles = StyleSheet.create({
  iconStyle: {
    width: '48%',
    height: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    height: '100%',
    aspectRatio: '1/1'
  }
});

export default Main