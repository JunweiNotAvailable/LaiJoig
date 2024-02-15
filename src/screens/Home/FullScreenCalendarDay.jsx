import { View, Text, SafeAreaView, StyleSheet, ScrollView, Pressable, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import { globalStyles, hours, weekDays } from '../../utils/Constants'
import { getDateString, getMinutesFromString, to12HourFormat } from '../../utils/Functions'
import { useUtilState } from '../../context/UtilContext'
import { useAppState } from '../../context/AppContext'
import { useHomeState } from '../../context/HomeContext'
import Button from '../../components/Button'
import { Entypo } from '@expo/vector-icons'

const FullScreenCalendarDay = ({ navigation, route }) => {

  const props = { ...useUtilState(), ...useAppState(), ...useHomeState(), ...route.params };
  const dateString = getDateString(props.selectedDate);
  const activities = props.activities.filter(a => a.startDateString <= dateString && a.endDateString >= dateString);
  const users = [...new Set(activities.map(a => a.userId))].map(id => props.users.find(u => u.id === id));

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.container]}>
      {/* toolbar */}
      <View style={[styles.toolbar, globalStyles.flexRow, globalStyles.justifyContent.spaceBetween, globalStyles.alignItems.center]}>
        <View style={[globalStyles.flexRow, globalStyles.alignItems.center]}>
          <Button icon={<Entypo name='chevron-left' size={28} style={{ marginRight: 12 }} onPress={() => navigation.goBack()}/>}/>
          <Text style={styles.title}>{dateString.replaceAll('-', ' / ')} {weekDays[props.selectedDate.getDay()]}</Text>
        </View>
        <View style={[globalStyles.flexRow, globalStyles.alignItems.center]}>
          <Button text='新增' style={styles.addButton} onPress={() => navigation.navigate('CreateActivity')}/>
        </View>
      </View>
      {/* body */}
      <ScrollView nestedScrollEnabled style={styles.bodyContainer}>
        {/* background */}
        <View style={styles.background}>
          <View style={[styles.username, { backgroundColor: '#fff' }]}/>
          <View style={[styles.timeColumn, { borderLeftColor: 'transparent' }]}>
            {[...hours, 0].map((h, j) => {
              return (
                <View style={[styles.hourBlock, {
                  borderTopColor: '#ccc',
                  borderTopWidth: .6,
                }]}/>
              )
            })}
          </View>
        </View>
        {/* content */}
        <View style={[styles.body, globalStyles.flexRow]}>
          {/* time colume */}
          <View style={[styles.userColumn]}>
            <View style={[styles.username, { backgroundColor: '#fff' }]}/>
            <View style={[styles.timeColumn, { borderLeftColor: 'transparent' }]}>
              {[...hours, 0].map((h, j) => {
                return (
                  <View style={styles.hourBlock}>
                    <Text style={styles.hourText}>{to12HourFormat(`${h}:00`)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
          {/* loop through users */}
          <ScrollView horizontal>
            {/* user columns */}
            {users.map((user, i) => {
              return (
                <Pressable>
                  <View style={styles.userColumn}>
                    <View style={styles.username}>
                      <Text style={styles.usernameText}>{user.name}</Text>
                    </View>
                    <View style={styles.timeColumn}>
                      {[...hours, 0].map((h, j) => {
                        const userActivities = activities.filter(a => 
                          a.userId === user.id && 
                          a.startTime >= `${h.toString().padStart(2, '0')}:00` && a.startTime < `${(h + 1).toString().padStart(2, '0')}:00` &&
                          j < 24
                        );
                        return (
                          <View style={styles.hourBlock} key={`block-${i}-${j}`}>
                            {userActivities.map((activity, k) => {
                              return (
                                <TouchableWithoutFeedback key={`${activity.id}`} onPress={() => navigation.navigate('Comments', { activity: activity })}>
                                  <View style={styles.shadowContainer}>
                                    <View style={[styles.activity, {
                                      backgroundColor: user.color,
                                      top: `${Number(activity.startTime.split(':')[1]) / 60 * 100}%`,
                                      height: `${(getMinutesFromString(activity.endTime) - getMinutesFromString(activity.startTime)) / 60 * 100}%`,
                                    }]}>
                                      <Text style={styles.description}>{activity.startTime}-{activity.endTime}</Text>
                                      <Text style={styles.description}>{activity.description}</Text>
                                    </View>
                                  </View>
                                </TouchableWithoutFeedback>
                              )
                            })}
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },

  bodyContainer: {
    position: 'relative',
    margin: 8,
  },
  background: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#fff',
  },
  body: {
    
  },
  userColumn: {
    width: 80,
  },
  username: {
    height: 20,
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 12,
  },
  timeColumn: {
    flex: 1,
  },
  hourBlock: {
    height: 50,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  hourText: {
    position: 'absolute',
    top: -10,
    padding: 3,
    color: '#888',
    backgroundColor: '#fff',
    fontSize: 10,
  },
  shadowContainer: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: .4,
    shadowRadius: 2,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  activity: {
    minHeight: 25,
    width: '96%',
    padding: 4,
    marginLeft: '2%',
    borderRadius: 8,
    position: 'absolute',
    zIndex: 100,
    elevation: 3,
  },
  description: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  }
});

export default FullScreenCalendarDay