import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeCalendar, CreateActivity } from "../../src";
import { Entypo } from "@expo/vector-icons";
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
import Account from "./Profile/Account";
import Preference from "./Profile/Preference";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// home screen
const Home = () => {
  return (
    <HomeStateProvider>
      <Stack.Navigator initialRouteName='HomeCalendar' screenOptions={{ headerShown: false }}>
        {/* calendar screen */}
        <Stack.Screen name='HomeCalendar' component={HomeCalendar} />
        {/* add activity screen */}
        <Stack.Screen name='CreateActivity' component={CreateActivity} />
        {/* comments screen */}
        <Stack.Screen name="Comments" component={Comments} />
      </Stack.Navigator>
    </HomeStateProvider>
  )
}

// chat screen
const Chat = () => {
  return (
    <></>
  )
}

// search screen
const Search = () => {
  return (
    <></>
  )
}

// notifications screen
const Notifications = () => {
  return (
    <></>
  )
}

// profile screen
const Profile = ({ navigation, route }) => {

  const toSplash = route.params.toSplash;

  React.useLayoutEffect(() => {
    // const routeName = getFocusedRouteNameFromRoute(route);
    // if (routeName === "Overview") {
    //   navigation.setOptions({ tabBarStyle: { display: 'flex', borderTopWidth: 0 } });
    // } else {
    //   navigation.setOptions({ tabBarStyle: { display: 'none' } });
    // }
  }, [navigation, route]);

  return (
    <ProfileStateProvider>
      <Stack.Navigator initialRouteName="Overview" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Overview" component={Overview}/>
        <Stack.Screen name="Settings" component={Settings} initialParams={{ toSplash: toSplash }} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="Account" component={Account} />
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

  const toSplash = () => {
    navigation.replace('Splash');
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
      <Tab.Screen name="Home" component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <Entypo name="home" size={24} color={focused ? globalStyles.colors.primary : '#000'} />
          ),
        }}
      />
      {/* chat */}
      <Tab.Screen name="Chat" component={Chat} options={{
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconStyle}>
            <Image source={focused ? urls.chatSelected : urls.chat} style={styles.imageStyle} />
          </View>
        ),
      }} />
      {/* search */}
      <Tab.Screen name="Search" component={Search} options={{
        tabBarIcon: ({ focused }) => (
          <Entypo name="magnifying-glass" size={24} color={focused ? globalStyles.colors.primary : '#000'} />
        ),
      }} />
      {/* notifications */}
      <Tab.Screen name="Notifications" component={Notifications} options={{
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconStyle}>
            <Image source={focused ? urls.bellSelected : urls.bell} style={styles.imageStyle} />
          </View>
        ),
      }} />
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
    height: '48%'
  },
  imageStyle: {
    height: '100%',
    aspectRatio: '1/1'
  }
});

export default Main