import { View, TextInput, Text, ScrollView, Pressable, StyleSheet, TouchableWithoutFeedback, SafeAreaView, KeyboardAvoidingView, Keyboard, Platform } from 'react-native'
import React, { useState, useEffect } from 'react';
import { globalStyles } from '../../utils/Constants';
import TopbarWithGoBack from '../../components/TopbarWithGoBack';
import { useAppState } from '../../context/AppContext';
import { useProfileState } from '../../context/ProfileContext';
import Button from '../../components/Button';
import axios from 'axios';
import {config} from '../../utils/config';
import Loading from '../../components/Loading';

const Account = () => {

  const props = { ...useAppState(), ...useProfileState() };
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessagePassword, setErrorMessagePassword] = useState('');
  const [focusing, setFocusing] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setErrorMessagePassword('');
  }, [changingPassword]);

  // click password window
  const handleWindowClick = (item) => {
    if (item === 'bg') {
      setChangingPassword(false);
    } else if (item === 'window') {
      Keyboard.dismiss();
    }
  }

  // check password inputs
  const validPasswords = () => {
    return password.length > 0 &&
      newPassword.length > 0 &&
      newPassword === newPasswordConfirm;
  }

  // save password
  const changePassword = async () => {
    setErrorMessagePassword('');
    if (!validPasswords()) return;
    setLoadingPassword(true);
    // check old password
    const isMatch = (await axios.get(`${config.api.general}/auth-access`, {params: {
      action: 'compare',
      password: password,
      hash: props.user.password
    }})).data;
    if (!isMatch) {
      setErrorMessagePassword('密碼錯誤');
      setLoadingPassword(false);
      return;
    }
    // save new password
    const hash = (await axios.get(`${config.api.general}/auth-access`, {params: {
      action: 'generate',
      password: newPassword,
      hash: '',
    }})).data;
    const newUser = { ...props.user, password: hash };
    await axios.post(`${config.api.general}/access-item`, {
      table: 'Laijoig-Users',
      data: newUser
    });
    setLoadingPassword(false);
    setChangingPassword(false);
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={[styles.container, globalStyles.safeArea]}>
          <KeyboardAvoidingView style={[globalStyles.flex1]} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
            <TopbarWithGoBack text='帳號'/>
            <ScrollView style={[globalStyles.flex1]}>
              <Pressable>
                {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
                <View style={[styles.inputGroup, globalStyles.flexRow, globalStyles.alignItems.center]}>
                  <Text style={styles.label}>密碼</Text>
                  <Text style={styles.password}>**********</Text>
                  <Button onPress={() => setChangingPassword(true)} icon={<Text style={styles.buttonText}>變更</Text>} style={styles.saveButton}/>
                </View>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
      {changingPassword && 
      <TouchableWithoutFeedback onPress={() => handleWindowClick('bg')}>
        <KeyboardAvoidingView style={styles.changePasswordWindow} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
          <TouchableWithoutFeedback onPress={() => handleWindowClick('window')}>
            <View style={styles.windowContainer}>
              <Text style={styles.windowTitle}>變更密碼</Text>
              <View style={[styles.inputGroupSmall, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.labelSmall}>舊密碼</Text>
                <TextInput secureTextEntry style={[styles.input, focusing === 'password' ? styles.focus : {}]} onBlur={() => setFocusing('')} onFocus={() => setFocusing('password')} placeholder='舊密碼' value={password} onChangeText={text => setPassword(text)} numberOfLines={1}/>
              </View>
              {errorMessagePassword && <Text style={[styles.errorMessage, styles.errorMessagePassword]}>{errorMessagePassword}</Text>}
              <View style={[styles.inputGroupSmall, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.labelSmall}>新密碼</Text>
                <TextInput secureTextEntry style={[styles.input, focusing === 'newPassword' ? styles.focus : {}]} onBlur={() => setFocusing('')} onFocus={() => setFocusing('newPassword')} placeholder='新密碼' value={newPassword} onChangeText={text => setNewPassword(text)} numberOfLines={1}/>
              </View>
              <View style={[styles.inputGroupSmall, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.labelSmall}>密碼確認</Text>
                <TextInput secureTextEntry style={[styles.input, focusing === 'newPasswordConfirm' ? styles.focus : {}]} onBlur={() => setFocusing('')} onFocus={() => setFocusing('newPasswordConfirm')} placeholder='密碼確認' value={newPasswordConfirm} onChangeText={text => setNewPasswordConfirm(text)} numberOfLines={1}/>
              </View>
              <View style={[globalStyles.alignItems.flexEnd, styles.buttonContainer]}>
                <Button onPress={changePassword} icon={loadingPassword ? <Loading size={17} color={'#fff'}/> : <Text style={styles.buttonText}>變更密碼</Text>} style={[styles.saveButton, { width: 92 }, validPasswords() ? {} : { backgroundColor: '#ddd' }]}/>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  label: {
    width: '16%'
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
    borderRadius: 10,
  },
  focus: {
    borderColor: globalStyles.colors.primary,
    borderWidth: 2,
  },
  saveButton: {
    backgroundColor: globalStyles.colors.primary,
    width: 64,
    height: 36,
    borderRadius: 10,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  password: {
    flex: 1,
    padding: 8,
  },
  errorMessage: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: globalStyles.colors.error,
    marginLeft: '17%',
    marginTop: 4,
  },
  errorMessagePassword: {
    marginLeft: '28%',
  },

  changePasswordWindow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: .4,
    shadowRadius: 5,
  },
  windowContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    width: '88%',
    elevation: 4,
  },
  inputGroupSmall: {
    paddingHorizontal: 8,
    marginTop: 16,
  },
  windowTitle: {
    fontWeight: 'bold',
    margin: 8,
    fontSize: 18,
  },
  labelSmall: {
    width: '28%',
  },
  buttonContainer: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
});

export default Account