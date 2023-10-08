import { View, Image, Text, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react'
import { useAppState } from '../context/AppContext';
import { globalStyles } from '../utils/Constants';
import axios from 'axios';
import config from '../../config.json';
import { registerForPushNotificationsAsync } from '../utils/Functions';

const Splash = ({ navigation, route }) => {

  const props = useAppState();
  const logoUrl = require('../../assets/images/logo.png');

  // load current user
  useEffect(() => {
    async function getUserId() {
      const userId = await AsyncStorage.getItem('LaijoigUserId');
      if (userId) {
        // load user from database
        const user = (await axios.get(`${config.api}/access-item`, {params: {
          table: 'Laijoig-Users',
          id: userId
        }})).data.Item;
        const group = (await axios.get(`${config.api}/access-item`, {params: {
          table: 'Laijoig-Groups',
          id: user.selectedGroup
        }})).data.Item;
        // get token
        const deviceToken = await registerForPushNotificationsAsync();
        const newUser = { ...user, deviceToken: deviceToken };
        props.setUser(newUser);
        props.setGroup(group);
        navigation.replace('Main');
        await axios.post(`${config.api}/access-item`, {
          table: 'Laijoig-Users',
          data: newUser
        });
      } else {
        navigation.replace('Auth');
      }
    }
    setTimeout(() => getUserId(), 500);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={logoUrl} style={styles.image}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
  },
  imageContainer: {
    width: 80,
    aspectRatio: '1/1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Splash