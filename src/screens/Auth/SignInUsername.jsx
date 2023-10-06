import { KeyboardAvoidingView, ActivityIndicator, Text, StyleSheet, Keyboard, TouchableWithoutFeedback, TextInput, Platform } from 'react-native'
import React, { useState } from 'react';
import { globalStyles } from '../../utils/Constants'
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/FontAwesome5'
import axios from 'axios';
import config from '../../../config.json';
import { useAuthState } from '../../context/AuthContext';

const SignInUsername = ({ navigation }) => {

  const props = useAuthState();
  const [userId, setUserId] = useState('');
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);

  // check if user id is valid
  const isValid = () => {
    return userId.length > 0 && /^[.a-zA-Z0-9_]+$/.test(userId);
  }
  // check if user exists
  const handleSubmit = async () => {
    if (!isValid()) return;
    setLoading(true);

    const user = (await axios.get(`${config.api}/access-item`, {params: {
      table: 'Laijoig-Users',
      id: userId
    }})).data.Item;

    props.setUserId(userId);
    if (user) { // welcome back
      navigation.navigate('SignInPassword');
    } else { // new user
      navigation.navigate('SignUp');
    }
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
        <Text style={styles.title}>登入</Text>
        <TextInput value={userId} placeholder='使用者ID' autoFocus onFocus={() => setFocus('userId')} onBlur={() => setFocus('')} onChangeText={text => setUserId(text)} style={[styles.input, focus ? styles.focus : {}]}/>
        <Button onPress={handleSubmit} icon={loading ? <ActivityIndicator color='#ffffff'/> : <Icon name="arrow-right" style={styles.buttonIcon}/>} style={[styles.button, isValid() ? {} : styles.buttonDisabled]}/>
      </KeyboardAvoidingView>
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
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 24,
  },
  input: {
    marginVertical: 16,
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

export default SignInUsername