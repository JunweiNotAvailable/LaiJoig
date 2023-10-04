import { View, Image, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import { globalStyles, weekDays } from '../utils/Constants';
import { getDateString, getTimeFromNow, to12HourFormat } from '../utils/Functions';
import { useNavigation } from '@react-navigation/native';

const Activitiy = ( props ) => {

  const selectedDateString = getDateString(props.selectedDate);
  const navigation = useNavigation();
  const activity = props.activity;
  const activityUser = props.users.filter(u => u.id === activity.userId)[0];
  const url = props.urls[activity.userId];
  const custom = activity.custom[selectedDateString];
  const commentCounts = props.comments.filter(c => c.activityId === activity.id && selectedDateString === c.dateString).length;

  const handleClick = (to) => {
    if (to === 'comments') {
      if (props.showDate) {
        !props.readOnly && navigation.navigate('HomeCalendar', { date: props.selectedDate });
      } else {
        !props.readOnly && navigation.navigate('Comments', { activity: activity });
      }
    } else if (to === 'user') {
      navigation.navigate('ProfileBrief', { briefUser: props.users.find(u => u.id === activity.userId) });
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => handleClick('comments')}>
      <View style={[styles.container, { borderLeftColor: activityUser.color }]}>
        {/* top row */}
        <View style={[globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
          {props.showDate ? <Text style={styles.dateString}>{selectedDateString.replaceAll('-', ' / ')} {weekDays[props.selectedDate.getDay()]}</Text> : 
          <TouchableWithoutFeedback onPress={() => handleClick('user')}>
            <View style={[globalStyles.flexRow, globalStyles.alignItems.center, globalStyles.flex1, styles.avatarRow]}>
              <View style={[globalStyles.flexCenter, styles.avatar, { backgroundColor: activityUser.color }]}>
                {url ? <Image source={{ uri: url }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{activityUser.name[0]}</Text>}
              </View>
              <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.username]}>{activityUser.name}</Text>
              <Text style={[styles.timeFromNow, globalStyles.flex1]} numberOfLines={1}>{getTimeFromNow(custom ? custom.iso : activity.iso)}</Text>
            </View>
          </TouchableWithoutFeedback>}
          <Text style={styles.time}>{to12HourFormat(custom ? custom.startTime : activity.startTime)} - {to12HourFormat(custom ? custom.endTime : activity.endTime)}</Text>
        </View>
        {/* bottom row */}
        <View style={[globalStyles.flexRow, globalStyles.alignItems.flexEnd, styles.bottomRow]}>
          <Text style={[styles.description, globalStyles.flex1]}>{custom ? custom.description : activity.description}</Text>
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
  dateString: {
    fontWeight: 'bold',
    fontSize: 15,
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