import { View, Text, StyleSheet, SafeAreaView, TouchableWithoutFeedback, KeyboardAvoidingView, TextInput, Keyboard } from 'react-native'
import { globalStyles } from '../../utils/Constants'
import React, { useState } from 'react'
import Button from '../../components/Button'
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Entypo } from '@expo/vector-icons'
import { useAuthState } from '../../context/AuthContext';
import { useAppState } from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../../config.json';
import { registerForPushNotificationsAsync } from '../../utils/Functions';
import Loading from '../../components/Loading';

const SignInPassword = ({ navigation }) => {

  const props = { ...useAppState(), ...useAuthState() };
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // check if user id is valid
  const isValid = () => password.length > 0;

  // sign in
  const handleSubmit = async () => {
    if (!isValid()) return;
    setLoading(true);

    // check password
    const user = (await axios.get(`${config.api}/access-item`, {params: {
      table: 'Laijoig-Users',
      id: props.userId
    }})).data.Item;
    const hash = user.password;
    const isMatch = (await axios.get(`${config.api}/auth-access`, {params: {
      action: 'compare',
      password: password,
      hash: hash
    }})).data || hash === '';
    // wrong password
    if (!isMatch) {
      setErrorMessage('Wrong password :P');
      setPassword('');
      setLoading(false);
      return;
    }

    // login
    const group = (await axios.get(`${config.api}/access-item`, {params: {
      table: 'Laijoig-Groups',
      id: user.selectedGroup,
    }})).data.Item;
    const deviceToken = await registerForPushNotificationsAsync();

    const newPassword = hash === '' ? (await axios.get(`${config.api}/auth-access`, {params: {
      action: 'generate',
      password: password,
      hash: '',
    }})).data : hash;
    const newUser = { ...user, deviceToken: deviceToken, password: newPassword };

    props.setUser(newUser);
    props.setGroup(group);
    await AsyncStorage.setItem('LaijoigUserId', user.id);
    navigation.replace('Main');
    // get device token
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Users',
      data: newUser
    });

    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
          <Text style={styles.title}>歡迎回來</Text>
          {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
          <TextInput secureTextEntry value={password} placeholder='密碼' autoFocus onFocus={() => setFocus('password')} onBlur={() => setFocus('')} onChangeText={text => setPassword(text)} style={[styles.input, focus ? styles.focus : {}]}/>
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
    paddingVertical: 96,
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
  errorMessage: {
    color: globalStyles.colors.error,
  },
  input: {
    marginVertical: 16,
    marginTop: 8,
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

export default SignInPassword