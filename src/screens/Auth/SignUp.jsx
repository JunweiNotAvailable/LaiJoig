import { globalStyles } from '../../utils/Constants'
import { TouchableWithoutFeedback, KeyboardAvoidingView, TextInput, Keyboard, View, Text, StyleSheet, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import Button from '../../components/Button';
import { useAuthState } from '../../context/AuthContext';
import { useAppState } from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { config } from '../../utils/config';
import { Entypo } from '@expo/vector-icons';
import { getDateString, getRandomHexColor, getRandomString, registerForPushNotificationsAsync } from '../../utils/Functions';
import Loading from '../../components/Loading';

const SignUp = ({ navigation }) => {

  const props = { ...useAppState(), ...useAuthState() };
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  // inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // check if user id is valid
  const isValid = () => {
    return username.length > 0 && 
      password.length >= 4 &&
      password === confirmPassword;
  }

  // check if user exists
  const handleSubmit = async () => {
    if (!isValid()) return;
    setLoading(true);

    // // group
    let newGroup = {
      id: getRandomString(12),
      name: '我的日曆',
      members: [props.userId],
      iso: new Date().toISOString(),
      lastSender: '',
      lastMessage: '',
      lastTime: '',
      url: '',
    };
    newGroup = { ...newGroup, members: [...newGroup.members, props.userId] };

    const hash = (await axios.get(`${config.api.general}/auth-access`, {params: {
      action: 'generate',
      password: password,
      hash: '',
    }})).data;
    // user
    const dateString = getDateString(new Date());
    const deviceToken = await registerForPushNotificationsAsync();
    const newUser = {
      id: props.userId,
      name: username,
      url: '',
      email: '',
      password: hash,
      color: getRandomHexColor(),
      title: '關於我',
      aboutMe: '',
      bosom: [],
      activityMonths: [dateString, dateString],
      deviceToken: deviceToken,
      groups: [newGroup.id],
      selectedGroup: newGroup.id,
    };
    props.setUser(newUser);
    props.setGroup(newGroup);
    await AsyncStorage.setItem('LaijoigUserId', newUser.id);
    navigation.replace('Main');

    // store to database
    await axios.post(`${config.api.general}/access-item`, {
      table: 'Laijoig-Groups',
      data: newGroup
    });
    await axios.post(`${config.api.general}/access-item`, {
      table: 'Laijoig-Users',
      data: newUser
    });

    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
          <Text style={styles.title}>第一次登入嗎？</Text>
          <TextInput value={username} placeholder='你的名稱' autoFocus onFocus={() => setFocus('username')} onBlur={() => setFocus('')} onChangeText={text => setUsername(text)} style={[styles.input, focus === 'username' ? styles.focus : {}]}/>
          <TextInput secureTextEntry value={password} placeholder='密碼' onFocus={() => setFocus('password')} onBlur={() => setFocus('')} onChangeText={text => setPassword(text)} style={[styles.input, focus === 'password' ? styles.focus : {}]}/>
          <TextInput secureTextEntry value={confirmPassword} placeholder='確認密碼' onFocus={() => setFocus('confirmPassword')} onBlur={() => setFocus('')} onChangeText={text => setConfirmPassword(text)} style={[styles.input, focus === 'confirmPassword' ? styles.focus : {}]}/>
          <Button onPress={handleSubmit} icon={loading ? <Loading size={20} color='#ffffff'/> : <Icon name="arrow-right" style={styles.buttonIcon}/>} style={[styles.button, isValid() ? {} : styles.buttonDisabled]}/>
          {/* back button */}
          <Button icon={<Entypo name='chevron-thin-left' size={24}/>} style={styles.back} onPress={() => navigation.goBack()}/>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 64,
    paddingVertical: 80,
  },
  back: {
    position: 'absolute',
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 24,
  },
  input: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 12,
  },
  focus: {
    borderWidth: 2,
    borderColor: globalStyles.colors.primary,
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 20,
  },
  button: {
    marginTop: 12,
    padding: 12,
    borderRadius: 28,
    backgroundColor: globalStyles.colors.primary,
    width: '100%',
    ...globalStyles.flexCenter,
  },
  buttonDisabled: {
    backgroundColor: '#ddd',
  }
});

export default SignUp