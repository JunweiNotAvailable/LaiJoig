import { View, Image, Text, TouchableWithoutFeedback, TextInput, ScrollView, KeyboardAvoidingView, StyleSheet, SafeAreaView, Keyboard, Pressable } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useHomeState } from '../context/HomeContext'
import { useAppState } from '../context/AppContext';
import { globalStyles, weekDays } from '../utils/Constants';
import Toolbar from '../components/Toolbar';
import Activitiy from '../components/Activitiy';
import { getDateString, getTimeFromNow, getRandomString } from '../utils/Functions';
import Button from '../components/Button';
import axios from 'axios';
import config from '../../config.json';

const Comments = ({ navigation, route }) => {
  
  const props = { ...useAppState(), ...useHomeState() };
  const scrollViewRef = useRef();
  const [activity, setActivity] = useState(route.params.activity);
  const [comments, setComments] = useState(props.comments.filter(c => c.activityId === activity.id).sort((a, b) => a.iso < b.iso ? -1 : 1));

  const [message, setMessage] = useState('');

  useEffect(() => {
    setComments(props.comments.filter(c => c.activityId === activity.id).sort((a, b) => a.iso < b.iso ? -1 : 1));
  }, [props.comments]);

  // when click on the avatar
  const handleClick = () => {

  }

  // send the message
  const handleSubmit = async () => {
    if (message.trim().length === 0) return;
    const newComment = {
      id: getRandomString(12),
      dateString: getDateString(props.selectedDate),
      iso: new Date().toISOString(),
      message: message,
      userId: props.user.id,
      activityId: activity.id,
      groupId: props.group.id,
    };
    props.setComments([...props.comments, newComment]);
    setMessage('');
    // save to database
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Comments',
      data: newComment
    });
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={globalStyles.safeArea}>
          <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
            <Toolbar text={'留言'}/>
            <View style={[styles.body, globalStyles.flex1]}>
              {/* activity */}
              <Text style={styles.date}>{getDateString(props.selectedDate).replaceAll('-', ' / ')} {weekDays[props.selectedDate.getDay()]}</Text>
              <Activitiy
                { ...props }
                activity={activity}
                readOnly
              />
              {/* comments list */}
              <View style={[globalStyles.flex1]}>
                <ScrollView style={styles.commentsList} ref={scrollViewRef} onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}>
                  <Pressable>
                    {comments.map((comment, i) => {
                      const commentUser = props.users.find(u => u.id === comment.userId);
                      const url = props.urls[commentUser.id];
                      return (
                        <View style={styles.comment} key={comment.id}>
                          <View style={[globalStyles.flexRow, globalStyles.justifyContent.flexStart]}>
                            <TouchableWithoutFeedback onPress={handleClick}>
                              <View style={[globalStyles.flexRow, globalStyles.alignItems.center, globalStyles.flex1, styles.avatarRow]}>
                                <View style={[globalStyles.flexCenter, styles.avatar, { backgroundColor: commentUser.color }]}>
                                  {url ? <Image source={{ uri: url }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{commentUser.name[0]}</Text>}
                                </View>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.username]}>{commentUser.name}</Text>
                                <Text style={[styles.timeFromNow, globalStyles.flex1]} numberOfLines={1}>{getTimeFromNow(comment.iso)}</Text>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                          <Text style={styles.message}>{comment.message}</Text>
                        </View>
                      )
                    })}
                  </Pressable>
                </ScrollView>
              </View>
              {/* input */}
              <View style={[globalStyles.flexRow]}>
                <TextInput placeholder='訊息...' multiline style={[globalStyles.flex1, styles.input]} value={message} onChangeText={text => setMessage(text)}/>
                <Button
                  style={[globalStyles.flexCenter, styles.sendButton]}
                  textStyle={styles.sendButtonText}
                  text='傳送'
                  onPress={handleSubmit}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  body: {
    paddingHorizontal: 12,
  },
  date: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 8,
  },

  commentsList: {
    marginTop: 12,
  },
  comment: {
    padding: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  avatarRow: {
    marginRight: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 50,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  username: {
    marginLeft: 6,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  timeFromNow: {
    color: '#888',
    fontSize: 12,
    marginLeft: 6,
  },
  message: {
    marginTop: 6,
    marginRight: 8,
    marginLeft: 28,
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

export default Comments