import { View, Text, StyleSheet } from 'react-native'
import { useFonts } from 'expo-font';
import React, { useState, useEffect } from 'react';
import Calendar from '../../components/Calendar';
import ActivityList from '../../components/ActivityList';
import { useHomeState } from '../../context/HomeContext';
import { useAppState } from '../../context/AppContext';
import axios from 'axios';
import config from '../../../config.json';
import { getDateString } from '../../utils/Functions';

const HomeCalendar = ({ navigation, route }) => {
  let [fontsLoaded] = useFonts({
    'Logo': require('../../../assets/fonts/OnelySans.ttf')
  });

  const props = { ...useAppState(), ...useHomeState() };
  // state
  const [loading, setLoading] = useState(true);

  // initial load activities
  useEffect(() => {
    async function initLoad() {
      // load activities
      const activitiesRes = await axios.get(`${config.api}/access-items`, { params: {
        table: 'Laijoig-Activities',
        filter: 'dateRange',
        id: props.group.id,
        month: getDateString(props.month).slice(0, 7),
      }});
      // load comments
      const commentsRes = await axios.get(`${config.api}/access-items`, { params: {
        table: 'Laijoig-Comments',
        filter: 'date',
        id: props.group.id,
        month: getDateString(props.month).slice(0, 7)
      }});
      props.setActivities(activitiesRes.data);
      props.setComments(commentsRes.data);
      props.setLoaded([getDateString(props.month).slice(0, 7)]);
      setLoading(false);
    }
    initLoad();
  }, []);

  
  useEffect(() => {
    async function loadUsers() {
      const newUsers = [];
      for (const id of props.user.bosom) {
        const newUser = (await axios.get(`${config.api}/access-item`, {params: {
          table: 'Laijoig-Users',
          id: id
        }})).data.Item;
        newUsers.push(newUser);
      }
      props.setUsers([...newUsers, props.user]);
    }
    if (props.user) {
      loadUsers();
    }
  }, [props.user]);

  return (
    <View style={styles.container}>
      <View style={styles.logobar}>
        <Text style={{ ...styles.logoText, fontFamily: fontsLoaded ? 'Logo' : '' }}>Laijoig</Text>
      </View>
      <View style={styles.shadowContainer}>
        <View style={styles.body}>
          <Calendar { ...props } loading={loading} setLoading={setLoading} />
          <ActivityList { ...props } loading={loading} setLoading={setLoading} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  logobar: {
    width: '100%',
    height: 80,
    marginLeft: 16,
    justifyContent: 'flex-end',
  },
  logoText: {
    fontSize: 24,
    marginBottom: 16,
  },
  shadowContainer: {
    flex: 1,
    shadowColor: '#171717',
    shadowOffset: { width: -1, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  body: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 3,
  }
});

export default HomeCalendar