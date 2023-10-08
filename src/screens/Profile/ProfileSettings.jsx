import { TextInput, Pressable, KeyboardAvoidingView, ScrollView, View, Text, SafeAreaView, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { globalStyles } from '../../utils/Constants'
import Toolbar from '../../components/Toolbar'
import { useAppState } from '../../context/AppContext'
import { useProfileState } from '../../context/ProfileContext'
import Button from '../../components/Button'
import axios from 'axios'
import config from '../../../config.json'
import Loading from '../../components/Loading'

const ProfileSettings = () => {

  const props = { ...useAppState(), ...useProfileState() };
  const [username, setUsername] = useState(props.user.name);
  const [title, setTitle] = useState(props.user.title);
  const [aboutMe, setAboutMe] = useState(props.user.aboutMe);
  const [focusing, setFocusing] = useState('');
  const [loading, setLoading] = useState(false);

  // save the profile data
  const saveChanges = async () => {
    if (username.length === 0) return;
    setLoading(true);
    const newUser = {
      ...props.user,
      name: username,
      title: title,
      aboutMe: aboutMe,
    };
    props.setUser(newUser);
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Users',
      data: newUser
    });
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.container, globalStyles.safeArea]}>
        <KeyboardAvoidingView style={[globalStyles.flex1]} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
          <Toolbar text='個人檔案'/>
          <ScrollView style={[globalStyles.flex1]}>
            <Pressable>
              <View style={[styles.inputGroup, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.label}>名稱</Text>
                <TextInput style={[styles.input, focusing === 'username' ? styles.focus : {}]} onBlur={() => setFocusing('')} onFocus={() => setFocusing('username')} placeholder='名稱' value={username} onChangeText={text => setUsername(text)} numberOfLines={1}/>
              </View>
              <View style={[styles.inputGroup, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.label}>標題</Text>
                <TextInput style={[styles.input, focusing === 'title' ? styles.focus : {}]} onBlur={() => setFocusing('')} onFocus={() => setFocusing('title')} placeholder='標題' value={title} onChangeText={text => setTitle(text)} numberOfLines={1}/>
              </View>
              <View style={[styles.inputGroup, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.label}>簡介</Text>
                <TextInput style={[styles.input, focusing === 'aboutMe' ? styles.focus : {}]} onBlur={() => setFocusing('')} onFocus={() => setFocusing('aboutMe')} placeholder={title} value={aboutMe} onChangeText={text => setAboutMe(text)} multiline/>
              </View>
              <View style={[globalStyles.alignItems.center]}>
                <Button onPress={saveChanges} icon={loading ? <Loading size={17} color={'#fff'}/> : <Text style={styles.buttonText}>儲存</Text>} style={styles.saveButton}/>
              </View>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    padding: 12,
    borderRadius: 28,
    width: '50%',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileSettings