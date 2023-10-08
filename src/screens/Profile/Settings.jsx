import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native'
import React from 'react';
import { globalStyles } from '../../utils/Constants';
import Toolbar from '../../components/Toolbar';
import Button from '../../components/Button';
import { useAppState } from '../../context/AppContext';
import { useProfileState } from '../../context/ProfileContext';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useProfileState(), ...route.params };

  const signOut = async () => {
    setTimeout(async () => {
      props.setUser(null);
      await AsyncStorage.removeItem('LaijoigUserId');
    }, 10);
    props.toSplash();
  }

  const options = [
    { route: "ProfileSettings", icon: <FeatherIcon name='user' size={20} style={{ paddingHorizontal: 12 }}/>, name: "個人檔案" },
    { route: "Account", icon: <MaterialIcon name='account-circle' size={20} style={{ paddingHorizontal: 12 }}/>, name: "帳號" },
    { route: "Preference", icon: <FeatherIcon name='check-square' size={20} style={{ paddingHorizontal: 12 }}/>, name: "我的喜好" },
    { route: "SignOut", icon: <FeatherIcon name='log-out' size={20} style={{ paddingHorizontal: 12 }}/>, name: "登出", onPress: signOut },
  ];

  return (
    <SafeAreaView style={[styles.container, globalStyles.safeArea]}>
      <Toolbar text={props.user.id}/>
      <ScrollView style={[globalStyles.flex1, styles.body]}>
        {options.map((option, i) => {
          return (
            <Pressable key={option.route}>
              <Button style={[styles.option, globalStyles.justifyContent.flexStart]} textStyle={{ fontSize: 16, }} icon={option.icon} text={option.name} onPress={() => option.onPress ? option.onPress() : navigation.navigate(option.route)}/>
            </Pressable>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    paddingHorizontal: 12,
  },
  option: {
    paddingVertical: 16,
  }
});

export default Settings