import { View, Image, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import { globalStyles } from '../utils/Constants';
import { getTimeFromNow, to12HourFormat } from '../utils/Functions';
import { useNavigation } from '@react-navigation/native';

const Activitiy = ( props ) => {

  const navigation = useNavigation();
  const activityUser = props.users.filter(u => u.id === props.activity.userId)[0];
  const url = props.urls[props.activity.userId];
  
  const commentCounts = props.comments.filter(c => c.activityId === props.activity.id).length;

  const handleClick = (to) => {
    if (to === 'comments') {
      !props.readOnly && navigation.navigate('Comments', { activity: props.activity });
    } else if (to === 'user') {

    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => handleClick('comments')}>
      <View style={[styles.container, { borderLeftColor: activityUser.color }]}>
        {/* top row */}
        <View style={[globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
          <TouchableWithoutFeedback onPress={() => handleClick('user')}>
            <View style={[globalStyles.flexRow, globalStyles.alignItems.center, globalStyles.flex1, styles.avatarRow]}>
              <View style={[globalStyles.flexCenter, styles.avatar, { backgroundColor: activityUser.color }]}>
                {url ? <Image source={{ uri: url }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{activityUser.name[0]}</Text>}
              </View>
              <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.username]}>{activityUser.name}</Text>
              <Text style={[styles.timeFromNow, globalStyles.flex1]} numberOfLines={1}>{getTimeFromNow(props.activity.iso)}</Text>
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.time}>{to12HourFormat(props.activity.startTime)} - {to12HourFormat(props.activity.endTime)}</Text>
        </View>
        {/* bottom row */}
        <View style={[globalStyles.flexRow, globalStyles.alignItems.flexEnd, styles.bottomRow]}>
          <Text style={[styles.description, globalStyles.flex1]}>{props.activity.description}</Text>
          <Text style={styles.commentButton}>{`${commentCounts}則留言`}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderLeftWidth: 3,
  },
  avatarRow: {
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
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
  time: {
    fontSize: 13,
  },
  bottomRow: {
    marginTop: 8,
  },
  description: {
    marginLeft: 4,
    marginRight: 8,
  },
  commentButton: {
    paddingHorizontal: 6,
    fontSize: 13,
    color: '#888',
  },
});

export default Activitiy