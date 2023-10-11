import { View, Text, Image, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native'
import { useFonts } from 'expo-font';
import React, { useState, useEffect } from 'react';
import Calendar from '../../components/Calendar';
import ActivityList from '../../components/ActivityList';
import { useHomeState } from '../../context/HomeContext';
import { useUtilState } from '../../context/UtilContext';
import { useAppState } from '../../context/AppContext';
import axios from 'axios';
import config from '../../../config.json';
import { getDateString } from '../../utils/Functions';
import { globalStyles } from '../../utils/Constants';

const HomeCalendar = ({ navigation, route }) => {
  let [fontsLoaded] = useFonts({
    'Logo': require('../../../assets/fonts/OnelySans.ttf')
  });

  const props = { ...useUtilState(), ...useAppState(), ...useHomeState(), ...route.params };
  // state
  const [loading, setLoading] = useState(true);

  // initial load activities
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  useEffect(() => {
    if (route?.params?.date) {
      props.setSelectedDate(route.params.date);
    }
    if (route?.params?.toActivity) {
      navigation.navigate('Comments', { activity: route.params.toActivity });
    }
  }, [route]);

  // reload data
  useEffect(() => {
    (async () => {
      setLoading(true);
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
      const compatActivities = [ ...props.activities, ...activitiesRes.data ];
      const compatComments = [ ...props.comments, ...commentsRes.data ];
      props.setActivities(Array.from(new Set(compatActivities.map(a => a.id))).map(id => compatActivities.find(a => a.id === id)));
      props.setComments(Array.from(new Set(compatComments.map(t => t.id))).map(id => compatComments.find(t => t.id === id)));
      setLoading(false);
    })();
  }, [props.trigger]);

  return (
    <SafeAreaView style={[styles.container, globalStyles.safeArea]}>
      <View style={[styles.logobar, globalStyles.flexRow]}>
        <View style={styles.logoImageContainer}>
          <Image style={styles.logoImage} source={require('../../../assets/images/logo.png')}/>
        </View>
        <Text style={{ ...styles.logoText, fontFamily: fontsLoaded ? 'Logo' : '' }}>Laijoig</Text>
      </View>
      <View style={styles.shadowContainer}>
        <View style={styles.body}>
          <Calendar { ...props } loading={loading} setLoading={setLoading} />
          <ActivityList { ...props } loading={loading} setLoading={setLoading} />
        </View>
      </View>
    </SafeAreaView>
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
    height: 56,
    marginLeft: 16,
    alignItems: 'center',
  },
  logoImageContainer: {
    height: 26,
    aspectRatio: '1/1',
    marginRight: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    color: globalStyles.colors.primary,
    fontSize: 24,
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
    flex: 1,
  }
});

export default HomeCalendar