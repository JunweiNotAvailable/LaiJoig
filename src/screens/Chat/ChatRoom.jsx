import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { useUtilState } from '../../context/UtilContext';
import { useChatState } from '../../context/ChatContext';
import { globalStyles, weekDays } from '../../utils/Constants';
import Toolbar from '../../components/Toolbar';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { getDateString, getRandomString, getTimeString, to12HourFormat } from '../../utils/Functions';
import axios from 'axios';
import { config } from '../../utils/config';
import MessageRow from '../../components/MessageRow';
import Loading from '../../components/Loading';

const ChatRoom = ({ navigation, route }) => {

  const messagesRef = useRef(null);
  const props = { ...useUtilState(), ...useAppState(), ...useChatState(), ...route.params };
  const room = props.room || props.group;
  const url = props.urls[room.id];
  const [message, setMessage] = useState('');
  const [paginationToken, setPaginationToken] = useState('');

  const [viewHeight, setViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollY, setScrollY] = useState(10);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [canLoad, setCanload] = useState(true);
  const [heightDiff, setHeightDiff] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // initial load
  useEffect(() => {
    (async () => {
      const res = (await axios.get(`${config.api}/query-items`, {params: {
        table: 'Laijoig-Messages',
        roomId: room.id,
        paginationToken: paginationToken,
      }})).data;
      props.setMessages(res.items.sort((a, b) => a.iso < b.iso ? -1 : 1));
      setPaginationToken(res.paginationToken);
      setLoading(false);
      setTimeout(() => messagesRef.current.scrollToEnd({}), 10);
    })();
  }, []);

  // load more messages when scroll y is 0
  useEffect(() => {
    if (paginationToken === 'null' || !canLoad) return;
    if (scrollY < 0 && !loadingMore) {
      (async () => {
        setLoadingMore(true);
        // set threshold
        setCanload(false);
        setTimeout(() => setCanload(true), 2000);
        const res = (await axios.get(`${config.api}/query-items`, {params: {
          table: 'Laijoig-Messages',
          roomId: room.id,
          paginationToken: paginationToken,
        }})).data;
        props.setMessages([...props.messages, ...res.items].sort((a, b) => a.iso < b.iso ? -1 : 1));
        setPaginationToken(res.paginationToken);
        // scroll to current position
        setTimeout(() => messagesRef.current.scrollTo({ y: heightDiff, animated: false }), 10);
        setLoadingMore(false);
      })();
    }
  }, [scrollY]);

  useEffect(() => {
    // reload messages
    messagesRef.current?.scrollToEnd({ animated: true });
  }, [props.trigger]);

  // check if the time of two messages are too far
  const isTooFar = (msg1, msg2) => {
    if (!msg1 || !msg2) return true;
    const sec = (new Date(msg1.iso).getTime() - new Date(msg2.iso).getTime()) / 1000;
    const hours = sec / 3600;
    return hours > 3;
  }

  const handleSubmit = async () => {
    if (message.trim().length === 0) return;
    const newMessage = {
      id: getRandomString(12),
      sender: props.user.id,
      message: message.trim(),
      iso: new Date().toISOString(),
      roomId: room.id,
      read: [],
    };
    props.setMessages([...props.messages, newMessage]);
    setMessage('');
    messagesRef.current.scrollToEnd({ animated: true });
    // store to database
    await axios.post(`${config.api}/access-item`, {
      table: 'Laijoig-Messages',
      data: newMessage
    });
    // push notification
    // for (const u of props.users) {
    //   if (u.id === props.user.id) continue;
    //   await sendPushNotification(
    //     u.deviceToken,
    //     `${props.user.name}傳送了一則訊息`,
    //     message,
    //     { 
    //       messageId: newMessage.id,
    //     }
    //   );
    // }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={globalStyles.safeArea}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'none' : 'padding'}>
          {/* tool bar */}
          <View style={[styles.toolbar, globalStyles.alignItems.center, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween]}>
            <View style={[globalStyles.flex1, globalStyles.alignItems.center, globalStyles.flexRow]}>
              {/* <Button icon={<Entypo name='chevron-left' size={28} style={styles.backButtonStyle} onPress={() => navigation.goBack()}/>}/> */}
              <TouchableWithoutFeedback>
                <View style={[globalStyles.flexRow, globalStyles.flex1, globalStyles.alignItems.center]}>
                  <View style={styles.groupAvatar}>
                    {url && <Image source={{ uri: url }} style={styles.groupImage}/>}
                  </View>
                  <Text style={[styles.groupName, globalStyles.flex1]} numberOfLines={1}>{room.name}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            {/* <Button icon={<Icon name='ellipsis-vertical' style={styles.menuIcon}/>} onPress={() => {}}/> */}
          </View>
          {/* messages */}
          {loading ?
            <View style={[globalStyles.flex1, globalStyles.flexCenter]}>
              <Loading/>
            </View>
            :
            <ScrollView  style={styles.messagesList} ref={messagesRef}
              onScroll={(e) => {
                // setup heights
                messagesRef.current.measure((x, y, width, height, pageX, pageY) => {
                  setViewHeight(height);
                });
                setContentHeight(e.nativeEvent.contentSize.height);
                // set scrolling values
                const scrollHeight = e.nativeEvent.contentSize.height - viewHeight;
                const toEnd = scrollHeight - e.nativeEvent.contentOffset.y;
                setScrollY(e.nativeEvent.contentOffset.y);
                setIsScrollingUp(toEnd > 800)
                // get current position
                if (e.nativeEvent.contentSize.height - contentHeight > 0) {
                  setHeightDiff(e.nativeEvent.contentSize.height - contentHeight);
                }
              }}
              scrollEventThrottle={16}
            >
              <Pressable>
                {loadingMore && <View style={styles.loadingMore}>
                  <Loading/>  
                </View>}
                {props.messages.map((msg, i) => {
                  return (
                    <>
                      {isTooFar(msg, props.messages[i - 1]) && <View style={globalStyles.flexCenter}>
                        <Text style={styles.globalTimeText}>{getDateString(new Date()) !== getDateString(new Date(msg.iso)) ? weekDays[new Date(msg.iso).getDay()] : ''} {to12HourFormat(getTimeString(new Date(msg.iso)))}</Text>
                      </View>}
                      <View key={`${msg.id}`} style={i === props.messages.length - 1 ? { marginBottom: 8 } : {}}>
                        <MessageRow
                          {...props}
                          message={msg}
                          prevMessage={props.messages[i - 1]}
                          nextMessage={props.messages[i + 1]}
                        />
                      </View>
                    </>
                  )
                })}
              </Pressable>
            </ScrollView>
          }
          {/* {isScrollingUp && <Button style={styles.toEndButton} icon={<Icon name='arrow-down' size={20} color={'#888'}/>} onPress={() => messagesRef.current.scrollToEnd({ animated: true })}/>} */}
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
    flex: 1,
  },
  loadingMore: {
    width: '100%',
    ...globalStyles.flexCenter,
    marginVertical: 8,
  },
  globalTimeText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 12,
  },
  toEndButton: {
    position: 'absolute',
    bottom: 72,
    width: '10%',
    aspectRatio: '1/1',
    left: '45%',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: .5,
    ...globalStyles.flexCenter,
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