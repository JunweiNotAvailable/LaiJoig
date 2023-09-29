import React, { useState } from "react";

import { NavigationContainer, useRoute } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login, Chat, Search, Notifications, Profile, HomeCalendar, CreateActivity } from "./src";
import { Entypo } from "@expo/vector-icons";
import { View, Image, StyleSheet, Platform } from "react-native";
import { globalStyles, urls } from "./src/utils/Constants";
import { getDateString } from './src/utils/Functions';
import { HomeStateProvider } from "./src/context/HomeContext";
import Comments from "./src/screens/Comments";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    <HomeStateProvider>
      <Stack.Navigator initialRouteName='HomeCalendar' screenOptions={{ headerShown: false }}>
        {/* calendar screen */}
        <Stack.Screen name='HomeCalendar' component={HomeCalendar}/>
        {/* add activity screen */}
        <Stack.Screen name='CreateActivity' component={CreateActivity}/>
        {/* comments screen */}
        <Stack.Screen name="Comments" component={Comments}/>
      </Stack.Navigator>
    </HomeStateProvider>
  )
}

const App = () => {

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
      }}>
        {/* home */}
        <Tab.Screen name="Home" component={Home}
          options={{
            tabBarIcon: ({ focused }) => (
              <Entypo name="home" size={24} color={focused ? globalStyles.colors.primary : '#000'}/>
            ),
          }}
        />
        {/* chat */}
        <Tab.Screen name="Chat" component={Chat} options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconStyle}>
              <Image source={focused ? urls.chatSelected : urls.chat} style={styles.imageStyle}/>
            </View>
          ),
        }}/>
        {/* search */}
        <Tab.Screen name="Search" component={Search} options={{
          tabBarIcon: ({ focused }) => (
            <Entypo name="magnifying-glass" size={24} color={focused ? globalStyles.colors.primary : '#000'}/>
          ),
        }}/>
        {/* notifications */}
        <Tab.Screen name="Notifications" component={Notifications} options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconStyle}>
              <Image source={focused ? urls.bellSelected : urls.bell} style={styles.imageStyle}/>
            </View>
          ),
        }}/>
        {/* profile */}
        <Tab.Screen name="Profile" component={Profile} options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconStyle}>
              <Image source={focused ? urls.userSelected : urls.user} style={styles.imageStyle}/>
            </View>
          ),
        }}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
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

export default App;