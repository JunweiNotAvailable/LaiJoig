import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableWithoutFeedback, Dimensions } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useHomeState } from '../../context/HomeContext';
import { useUtilState } from '../../context/UtilContext';
import { useAppState } from '../../context/AppContext';
import { globalStyles, weekDays } from '../../utils/Constants';
import { getDateString, getMonthBoard } from '../../utils/Functions';
import Button from '../../components/Button';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('screen').width;

const Calendar = ( props ) => {

  const navigation = useNavigation();
  const now = new Date();
  const nowString = getDateString(now);
  const selectedDateString = getDateString(props.selectedDate);
  const [board, setBoard] = useState(getMonthBoard(props.month.getFullYear(), props.month.getMonth() + 1));
  
  return (
    <View style={styles.container}>
      {/* toolbar */}
      <View style={styles.toolbar}>
        <Text style={[globalStyles.bold]}>{getDateString(props.month).slice(0, 7).replace('-', ' / ')}</Text>
      </View>
      {/* board */}
      <View style={styles.board}>
        <View style={[globalStyles.flexRow]}>
          {weekDays.map((weekDay, i) => {
            return (
              <Text style={[globalStyles.flex1, styles.weekDay]}>{weekDay[1]}</Text>
            )
          })}
        </View>
        {board.map((row, i) => {
          return (
            <View style={[globalStyles.flexRow, styles.row]} key={`row-${i}`}>
              {row.map((cell, j) => {
                const dateString = cell ? getDateString(cell) : '';
                const dateActivities = props.activities
                  .filter(a => a.startDateString <= dateString && a.endDateString >= dateString);
                return (
                  cell ? 
                  <TouchableWithoutFeedback key={`cell-${i}-${j}`} onPress={() => {
                    props.setSelectedDate(cell);
                    navigation.navigate('FullCalendarDay');
                  }}>
                    <View style={styles.cell}>
                      <Text style={[dateString < nowString ? { color: globalStyles.colors.gray } : {}, styles.cellText]}>{cell.getDate()}</Text>
                      {dateActivities.slice(0, 3).map((activity, k) => {
                        const user = props.users.find(u => u.id === activity.userId);
                        return (
                          <View key={`${activity.id}-${i}-${j}`} style={[styles.activity, { backgroundColor: user.color }]}>
                            <Text style={styles.activityText} numberOfLines={1} ellipsizeMode='tail'>{activity.description}</Text>
                          </View>
                        )
                      })}
                      {dateActivities.length > 3 && <View style={[styles.activity, { backgroundColor: '#ccc' }]}>
                        <Text style={styles.activityText}>更多...</Text>
                      </View>}
                    </View>
                  </TouchableWithoutFeedback>
                  : <View style={styles.cell} key={`cell-${i}-${j}`}/>
                )
              })}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const FullCalendar = ({ navigation, route }) => {

  const props = { ...useUtilState(), ...useAppState(), ...useHomeState(), ...route.params };
  
  const flatListRef = useRef(null);
  const [calendarData, setCalendarData] = useState([]);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // go to standard mode
  useEffect(() => {
    if (props.isDoubleClick) {
      props.setIsDoubleClick(false);
      navigation.replace('HomeCalendar');
    }
  }, [props.isDoubleClick]);

  // initial calendar data
  useEffect(() => {
    const calendarData = [];
    const currentDate = new Date(props.month);
    for (let i = -1; i <= 1; i++) {
      const date = new Date();
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

  // re-render data when scroll to prev/next month  
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
      <Calendar { ...props } month={item.date}/>
    </View>
  )

  return (
    <SafeAreaView style={[globalStyles.safeArea, globalStyles.flex1]}>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  toolbarIconStyle: {
    padding: 8,
  },
  board: {
    flex: 1,
  },
  weekDay: {
    fontSize: 10,
    padding: 3,
    textAlign: 'center',
    color: '#666',
  },
  row: {
    flex: 1,
    width: '100%',
  },
  cellText: {
    fontSize: 11,
  },
  cell: {
    flex: 1,
    ...globalStyles.alignItems.center,
    borderTopWidth: .5,
    borderLeftWidth: .5,
    borderColor: '#ddd',
    padding: 2,
    backgroundColor: '#fff',
  },
  activity: {
    width: '100%',
    padding: 3,
    marginTop: 2,
    borderRadius: 6,
  },
  activityText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  flatList: {
  },
  calendarContainer: {
    width: screenWidth,
    height: '100%',
    flexGrow: 1,
  },
});

export default FullCalendar