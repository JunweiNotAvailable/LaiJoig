import { View, Text, Image, StyleSheet, SafeAreaView, FlatList, Dimensions } from 'react-native'
import { useFonts } from 'expo-font';
import React, { useState, useEffect, useRef } from 'react';
import Calendar from '../../components/Calendar';
import ActivityList from '../../components/ActivityList';
import { useHomeState } from '../../context/HomeContext';
import { useUtilState } from '../../context/UtilContext';
import { useAppState } from '../../context/AppContext';
import axios from 'axios';
import config from '../../../config.json';
import { getDateString } from '../../utils/Functions';
import { globalStyles } from '../../utils/Constants';

const screenWidth = Dimensions.get('screen').width;

const HomeCalendar = ({ navigation, route }) => {
  let [fontsLoaded] = useFonts({
    'Logo': require('../../../assets/fonts/OnelySans.ttf')
  });

  const flatListRef = useRef(null);
  const props = { ...useUtilState(), ...useAppState(), ...useHomeState(), ...route.params };
  const [calendarData, setCalendarData] = useState([]);
  // state
  const [loading, setLoading] = useState(true);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // initial calendar data
  useEffect(() => {
    const calendarData = [];
    const currentDate = new Date(props.month);
    for (let i = -1; i <= 1; i++) {
      const date = new Date(props.month);
      date.setMonth(currentDate.getMonth() + i);
      calendarData.push({ key: i, date: date });
    }
    setCalendarData(calendarData);
  }, []);

  useEffect(() => {
    if (calendarData.length > 2) {
      flatListRef.current.scrollToIndex({ index: 1, animated: false })
    }
  }, [calendarData]);

  // go to full calendar mode
  useEffect(() => {
    if (props.isDoubleClick) {
      console.log('double click')
      props.setIsDoubleClick(false);
      navigation.replace('FullCalendar');
    }
  }, [props.isDoubleClick]);

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
    // handle data
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
  
  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    if (x % screenWidth !== 0 || !scrollEnabled) return;
    const newData = [...calendarData];
    setScrollEnabled(false);
    setTimeout(() => setScrollEnabled(true), 100);
    if (x <= 0) {
      const date = new Date(newData[0].date);
      date.setMonth(date.getMonth() - 1);
      newData.unshift({ key: newData[0].key - 1, date: date });
      newData.pop();
      props.setMonth(newData[1].date);
    } else if (x >= screenWidth * 2) {
      const date = new Date(newData[2].date);
      date.setMonth(date.getMonth() + 1);
      newData.push({ key: newData[2].key + 1, date: date });
      newData.shift();
      props.setMonth(newData[1].date);
    }
    setCalendarData(newData);
  }

  const renderCalendar = ({ item }) => (
    <View style={styles.calendarContainer}>
      <Calendar { ...props } loading={loading} setLoading={setLoading} month={item.date}/>
    </View>
  )

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
          <FlatList
            ref={flatListRef}
            style={styles.flatList}
            data={calendarData}
            horizontal
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current.scrollToIndex({ index: 1, animated: false })
            }}
            onScrollToIndexFailed={() => {}}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={screenWidth}
            keyExtractor={item => item.key.toString()}
            renderItem={renderCalendar}
            onScroll={handleScroll}
          />
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
  },
  flatList: {
    flexGrow: 0
  },
  calendarContainer: {
    width: screenWidth,
    flexGrow: 1,
  }
});

export default HomeCalendar