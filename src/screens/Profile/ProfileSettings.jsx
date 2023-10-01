import { TextInput, Pressable, KeyboardAvoidingView, ScrollView, View, Text, SafeAreaView, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { globalStyles } from '../../utils/Constants'
import Toolbar from '../../components/Toolbar'
import { useAppState } from '../../context/AppContext'
import { useProfileState } from '../../context/ProfileContext'

const ProfileSettings = () => {

  const props = { ...useAppState(), ...useProfileState() };
  const [username, setUsername] = useState(props.user.name);
  const [title, setTitle] = useState(props.user.title);
  const [aboutMe, setAboutMe] = useState(props.user.aboutMe);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.container, globalStyles.safeArea]}>
        <KeyboardAvoidingView style={[globalStyles.flex1]} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
          <Toolbar text='設定'/>
          <ScrollView style={[globalStyles.flex1]}>
            <Pressable>
              <View style={[styles.inputGroup, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.label}>使用者名稱</Text>
                <TextInput style={styles.input} placeholder='使用者名稱' value={username} onChangeText={text => setUsername(text)} numberOfLines={1}/>
              </View>
              <View style={[styles.inputGroup, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.label}>標題</Text>
                <TextInput style={styles.input} placeholder='標題' value={title} onChangeText={text => setTitle(text)} numberOfLines={1}/>
              </View>
              <View style={[styles.inputGroup, globalStyles.flexRow, globalStyles.alignItems.center]}>
                <Text style={styles.label}>簡介</Text>
                <TextInput style={styles.input} placeholder={title} value={aboutMe} onChangeText={text => setAboutMe(text)} multiline/>
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
});

export default ProfileSettings