import { View, Text, Pressable, Image, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useAppState } from '../../context/AppContext'
import { useProfileState } from '../../context/ProfileContext'
import { globalStyles } from '../../utils/Constants'
import Toolbar from '../../components/Toolbar'
import Button from '../../components/Button'
import Icon from 'react-native-vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Loading from '../../components/Loading'

const Preference = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useProfileState(), ...route.params };

  // values
  const calendarFormats = [
    { name: '標準', type: 'standard' },
    { name: '全螢幕', type: 'full' },
  ];
  const loadingIcons = [
    { name: '一般', type: 'normal' },
    { name: '排球', type: 'volleyball' },
  ]
  const chatThemes = [
    { name: '一般', type: 'normal' },
    { name: '彩色', type: 'colorful' },
  ]
  // states
  const [calendarFormat, setCalendarFormat] = useState(props.preference.calendarFormat || 'standard');
  const [loadingIcon, setLoadingIcon] = useState(props.preference.loadingIcon || 'normal');
  const [chatTheme, setChatTheme] = useState(props.preference.chatTheme || 'normal');

  const saveCalendarFormat = async (type) => {
    setCalendarFormat(type);
    props.setPreference({ ...props.preference, calendarFormat: type });
    await AsyncStorage.setItem('calendarFormat', type);
  }
  const saveLoadingIcon = async (type) => {
    setLoadingIcon(type);
    props.setPreference({ ...props.preference, loadingIcon: type });
    await AsyncStorage.setItem('loadingIcon', type);
  }
  const saveChatTheme = async (type) => {
    setChatTheme(type);
    props.setPreference({ ...props.preference, chatTheme: type });
    await AsyncStorage.setItem('chatTheme', type);
  }

  return (
    <SafeAreaView style={[styles.container, globalStyles.safeArea]}>
      <Toolbar text='我的喜好'/>
      <ScrollView style={[globalStyles.flex1, styles.body]}>
        <Pressable>

          {/* calendar format */}
          {/* <Text style={styles.subtitle}>日曆形式</Text>
          {calendarFormats.map((item, i) => {
            return (
              <Button icon={<View style={[styles.checkboxGroup, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
                <View style={[globalStyles.flexRow, globalStyles.alignItems.center]}>
                  <View style={[styles.checkbox, calendarFormat === item.type ? styles.checked : {}]}>
                    <Icon name='check' size={10} color={'#fff'}/>
                  </View>
                  <Text style={styles.checkboxText}>{item.name}</Text>
                </View>
                <Loading size={24} type={item.type}/>
              </View>} onPress={async () => await saveCalendarFormat(item.type)}/>
            )
          })} */}

          {/* loading */}
          <View style={styles.marginTop}/>
          <Text style={styles.subtitle}>載入圖案</Text>
          {loadingIcons.map((icon, i) => {
            return (
              <Button icon={<View style={[styles.checkboxGroup, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
                <View style={[globalStyles.flexRow, globalStyles.alignItems.center]}>
                  <View style={[styles.checkbox, loadingIcon === icon.type ? styles.checked : {}]}>
                    <Icon name='check' size={10} color={'#fff'}/>
                  </View>
                  <Text style={styles.checkboxText}>{icon.name}</Text>
                </View>
                <Loading size={24} type={icon.type}/>
              </View>} onPress={async () => await saveLoadingIcon(icon.type)}/>
            )
          })}

          {/* chat theme */}
          {/* <View style={styles.marginTop}/>
          <Text style={styles.subtitle}>聊天室主題</Text>
          {chatThemes.map((icon, i) => {
            return (
              <Button icon={<View style={[styles.checkboxGroup, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
                <View style={[globalStyles.flexRow, globalStyles.alignItems.center]}>
                  <View style={[styles.checkbox, chatTheme === icon.type ? styles.checked : {}]}>
                    <Icon name='check' size={10} color={'#fff'}/>
                  </View>
                  <Text style={styles.checkboxText}>{icon.name}</Text>
                </View>
              </View>} onPress={async () => await saveChatTheme(icon.type)}/>
            )
          })} */}

        </Pressable>
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
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  checkboxGroup: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    ...globalStyles.flexCenter,
  },
  checked: {
    borderColor: globalStyles.colors.primary,
    backgroundColor: globalStyles.colors.primary,
  },
  checkboxText: {
    marginLeft: 16,
  },
  marginTop: {
    marginTop: 12,
  }
});

export default Preference