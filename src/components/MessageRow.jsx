import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { globalStyles } from '../utils/Constants';

const MessageRow = ( props ) => {

  const prevMessage = props.prevMessage;
  const nextMessage = props.nextMessage;
  const message = props.message;
  const user = props.users.find(u => u.id === message.sender);
  const isMe = user.id === props.user.id;
  const url = props.urls[user?.id];
  const backgroundColor = props.preference.chatTheme === 'normal' ? '#eee' : user.color + '16';

  return (
    isMe ?
    <View style={[styles.container, globalStyles.flexRow, globalStyles.alignItems.flexEnd, globalStyles.justifyContent.flexEnd]}>
      <View style={[styles.message, {
        borderTopRightRadius: prevMessage?.sender === user.id ? 8 : 16,
        borderBottomRightRadius: nextMessage?.sender === user.id ? 8 : 16,
        backgroundColor: backgroundColor,
      }]}>
        <Text style={styles.messageText}>{message.message}</Text>
      </View>
    </View>
    :

    <View style={[styles.container, globalStyles.flexRow, globalStyles.alignItems.flexEnd, globalStyles.justifyContent.flexStart]}>
      <View style={[styles.avatar, globalStyles.flexCenter, { backgroundColor: nextMessage?.sender === user.id ? 'transparent' : user.color }]}>
        {nextMessage?.sender === user.id ? <></> : url ? <Image source={{ uri: url }} style={styles.avatarImage}/> : <Text style={styles.avatarText}>{user.name[0]}</Text>}
      </View>
      <View style={[styles.message, styles.messageLeft, {
        borderTopLeftRadius: prevMessage?.sender === user.id ? 8 : 16,
        borderBottomLeftRadius: nextMessage?.sender === user.id ? 8 : 16,
        backgroundColor: backgroundColor,
      }]}>
        <Text style={styles.messageText}>{message.message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 20,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  message: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 16,
    maxWidth: '70%',
  },
  messageLeft: {
    marginLeft: 12,
  },
  messageText: {
    fontSize: 15,
  }

});

export default MessageRow