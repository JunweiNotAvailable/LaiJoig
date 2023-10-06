import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { useChatState } from '../../context/ChatContext';
import { globalStyles } from '../../utils/Constants';
import Toolbar from '../../components/Toolbar';
import Button from '../../components/Button';
import { Entypo } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import { firestore } from '../../utils/firebase';
import { addDoc, query, getDocs, collection, where, orderBy, limit } from 'firebase/firestore';

const ChatRoom = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useChatState(), ...route.params };
  const group = props.group;
  const url = props.url;
  const [message, setMessage] = useState('');

  // get messages from firestore
  useEffect(() => {
    const doc = query(collection(firestore, group.id), orderBy("iso"), limit(25));
    
  }, []);

  const handleSubmit = async () => {
    if (message.trim().length === 0) return;
    const newMessage = {
      sender: props.user.id,
      message: message.trim(),
      iso: new Date().toISOString(),
      status: 'unread',
    };

    setMessage('');
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={globalStyles.safeArea}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
          {/* tool bar */}
          <View style={[styles.toolbar, globalStyles.alignItems.center, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween]}>
            <View style={[globalStyles.flex1, globalStyles.alignItems.center, globalStyles.flexRow]}>
              <Button icon={<Entypo name='chevron-left' size={28} style={styles.backButtonStyle} onPress={() => navigation.goBack()}/>}/>
              <TouchableWithoutFeedback>
                <View style={[globalStyles.flexRow, globalStyles.flex1, globalStyles.alignItems.center]}>
                  <View style={styles.groupAvatar}>
                    {url && <Image source={{ uri: url }} style={styles.groupImage}/>}
                  </View>
                  <Text style={[styles.groupName, globalStyles.flex1]} numberOfLines={1}>{group.name}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            {/* <Button icon={<Icon name='ellipsis-vertical' style={styles.menuIcon}/>} onPress={() => {}}/> */}
          </View>
          {/* messages */}
          <ScrollView style={styles.messagesList}>
            <Pressable>

            </Pressable>
          </ScrollView>
          {/* send message */}
          <View style={[globalStyles.flexRow, styles.inputGroup]}>
            <TextInput placeholder='訊息...' multiline style={[globalStyles.flex1, styles.input]} value={message} onChangeText={text => setMessage(text)}/>
            <Button
              style={[globalStyles.flexCenter, styles.sendButton]}
              textStyle={styles.sendButtonText}
              text='傳送'
              onPress={handleSubmit}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  toolbar: {
    padding: 8,
    paddingVertical: 12,
  },
  backButtonStyle: {
    padding: 6,
  },
  groupAvatar: {
    width: 40,
    aspectRatio: '1/1',
    borderRadius: 50,
    backgroundColor: '#eee',
    marginLeft: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  groupName: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: 'bold',
  },
  menuIcon: {
    paddingHorizontal: 12,
    fontSize: 18,
    padding: 6,
  },
  messagesList: {
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    flex: 1,
  },
  inputGroup: {
    paddingHorizontal: 8,
  },
  input: {
    borderColor: '#aaa',
    borderWidth: .5,
    paddingHorizontal: 12,
    height: 40,
    margin: 8,
    borderRadius: 28,
  },
  sendButton: {
    padding: 12,
  },
  sendButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatRoom