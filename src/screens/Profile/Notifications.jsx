import { Pressable, ScrollView, TouchableWithoutFeedback, View, StyleSheet, SafeAreaView, Text } from 'react-native'
import React, { useEffect } from 'react'
import { globalStyles } from '../../utils/Constants'
import Topbar from '../../components/Topbar'
import axios from 'axios'
import { config } from '../../utils/config'
import { useAppState } from '../../context/AppContext'
import { useUtilState } from '../../context/UtilContext'
import { getTimeFromNow } from '../../utils/Functions'
import { useHomeState } from '../../context/HomeContext'

const Notifications = ({ navigation, route }) => {

  const props = { ...useUtilState(), ...useAppState(), ...useHomeState() };

  useEffect(() => {
    (async () => {
      const data = (await axios.get(`${config.api.general}/access-items`, {params: {
        table: 'Laijoig-Notifications',
        filter: 'groupId',
        id: props.group.id,
      }})).data;
      props.setNotifications(data.sort((a, b) => a.iso < b.iso ? 1 : -1));
    })();
  }, [props.trigger, props.receivedComment]);

  const unread = (notification) => {
    return !notification?.read.includes(props.user.id)
  }

  const handleClick = async (notification) => {
    const activity = (await axios.get(`${config.api.general}/access-item`, { params: {
      table: 'Laijoig-Activities',
      id: notification.id.slice(0, notification.id.length - 11),
    }})).data.Item;
    const comment = (await axios.get(`${config.api.general}/access-item`, { params: {
      table: 'Laijoig-Comments',
      id: notification.commentId,
    }})).data.Item;
    navigation.navigate('HomeCalendar', { date: new Date(comment.dateString), toActivity: activity });
    if (unread(notification)) {
      const newNotification = { ...notification, read: [...notification.read, props.user.id] };
      await axios.post(`${config.api.general}/access-item`, {
        table: 'Laijoig-Notifications',
        data: newNotification
      });
    }
  }

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.container]}>
      <Topbar title={'通知'} buttons={[]} />
      <ScrollView style={[styles.list]}>
        <Pressable>
          {props.notifications.map((notification, i) => {
            return (
              <TouchableWithoutFeedback key={notification.id} onPress={async () => await handleClick(notification)}>
                <View style={styles.notification}>
                  <View style={styles.topRow}>
                    <Text style={[styles.title, globalStyles.flex1, , unread(notification) ? styles.bold : {}]} numberOfLines={1}>{notification.title}</Text>
                    <View style={[globalStyles.flexRow, globalStyles.alignItems.center, globalStyles.justifyContent.flexEnd]}>
                      {unread(notification) && <View style={styles.unread}/>}
                      <Text style={[styles.time, unread(notification) ? styles.bold : {}]}>{getTimeFromNow(notification.iso)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.message, , unread(notification) ? styles.bold : {}]} numberOfLines={1} ellipsizeMode='tail'>{notification.message}</Text>
                </View>
              </TouchableWithoutFeedback>
            )
          })}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  notification: {
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: .5,
    padding: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    marginTop: 8,
    color: '#666',
  },
  unread: {
    width: 5,
    height: 5,
    borderRadius: 10,
    backgroundColor: globalStyles.colors.red,
    marginRight: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default Notifications