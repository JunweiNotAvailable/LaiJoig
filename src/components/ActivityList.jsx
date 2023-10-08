import { View, Image, Text, StyleSheet, ScrollView, Pressable, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useEffect } from 'react'
import { globalStyles, weekDays } from '../utils/Constants';
import { getDateString, useInterval } from '../utils/Functions';
import Button from './Button';
import { useNavigation } from '@react-navigation/native';
import Activitiy from './Activitiy';
import Loading from './Loading';

const ActivityList = ( props ) => {
  const navigation = useNavigation();

  const selectedDateString = getDateString(props.selectedDate);
  const [activities, setActivities] = useState([]); 

  const [noTasksImage, setNoTasksImage] = useState(require('../../assets/images/no-tasks.png'));
  const [noTasksCount, setNoTasksCount] = useState(0);

  useInterval(() => {
    if (noTasksCount === 3) {
      setNoTasksImage(require('../../assets/images/no-tasks-wink.png'))
    } else if (noTasksCount === 4) {
      setNoTasksImage(require('../../assets/images/no-tasks.png'))
    }
    setNoTasksCount(noTasksCount > 4 ? 0 : noTasksCount + 1);
  }, 700);

  useEffect(() => {
    setActivities(props.activities.filter(a => a.startDateString <= selectedDateString && a.endDateString >= selectedDateString)
      .sort((a, b) => {
        if (a.startTime !== b.startTime) return a.startTime < b.startTime ? -1 : 1;
        if (a.endTime !== b.endTime) return a.endTime < b.endTime ? -1 : 1; 
        return a.iso < b.iso;
      }));
  }, [props.activities, props.selectedDate]);

  return (
    <View style={[styles.container, globalStyles.flex1]}>
      {/* title */}
      <View style={[styles.title, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
        <Text style={styles.titleText}>{selectedDateString.replaceAll('-', ' / ')} {weekDays[props.selectedDate.getDay()]}</Text>
        <Button
          style={styles.addButton}
          text={'新增'}
          onPress={() => navigation.navigate('CreateActivity')}
        />
      </View>
      {/* scroll view */}
      {props.loading ? 
      <View style={[globalStyles.flex1, globalStyles.flexCenter]}>
        <Loading/>
      </View>
      :
      activities.length === 0 ? 
      <View style={[globalStyles.flexCenter, globalStyles.flex1]}>
        <View style={styles.noTasksImageContainer}>
          <Image source={noTasksImage} style={styles.noTasksImage}/>
        </View>
        <Text style={styles.noTasksText}>沒有活動</Text>
      </View>
      :
      <ScrollView>
        <Pressable>
          {activities.map((activity, i) => {
            const activityComments = props.comments.filter(c => c.activityId === activity.id && c.dateString === selectedDateString).sort((a, b) => a.iso > b.iso ? -1 : 1);
            const lastComment = activityComments.length > 0 && activityComments[0];
            const lastCommentUser = props.users.find(u => u.id === lastComment.userId);
            const url = props.urls[lastCommentUser?.id];
            const custom = activity.custom[selectedDateString];
            return (
              !custom?.delete && 
              <View style={styles.activityContainer} key={activity.id}>
                <Activitiy
                  { ...props }
                  activity={activity}
                />
                {(activityComments.length > 0) && 
                <TouchableWithoutFeedback onPress={() => navigation.navigate('Comments', { activity: activity })}>
                  <View style={[styles.lastComment, globalStyles.flexRow, globalStyles.alignItems.center]}>
                    <View style={[styles.avatar, globalStyles.flexCenter, { backgroundColor: lastCommentUser.color }]}>
                      {url ? <Image source={{ uri: url }} style={styles.avatarImage} />: <Text style={styles.avatarTextSmall}>{lastCommentUser.name[0]}</Text>}
                    </View>
                    <Text style={styles.username}>{lastCommentUser.name}</Text>
                    <Text style={[styles.lastMessage, globalStyles.flex1]} ellipsizeMode='tail' numberOfLines={1}>{lastComment.message}</Text>
                  </View>
                </TouchableWithoutFeedback>}
              </View>
            )
          })}
        </Pressable>
      </ScrollView>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  title: {
    paddingVertical: 4,
  },
  titleText: {
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  activityContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  lastComment: {
    marginVertical: 4,
    marginHorizontal: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderLeftColor: '#ddd',
    borderLeftWidth: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: '#000',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  avatarTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 9,
  },
  username: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 13,
  },
  lastMessage: {
    marginLeft: 8,
    overflow: 'hidden',
    fontSize: 13,
  },
  noTasksImageContainer: {
    width: '20%',
    aspectRatio: '1/1',
  },
  noTasksImage: {
    width: '100%',
    height: '100%',
  },
  noTasksText: {
    marginTop: 4,
    color: '#ccc',
    fontSize: 13,
    fontWeight: 'bold'
  }
});

export default ActivityList