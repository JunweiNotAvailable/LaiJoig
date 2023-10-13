import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import Button from './Button';
import { Entypo } from '@expo/vector-icons';
import { globalStyles, weekDays } from '../utils/Constants';
import { getDateString, getMonthBoard } from '../utils/Functions';
import axios from 'axios';
import config from '../../config.json';

const Calendar = ( props ) => {
  const now = new Date();
  const nowString = getDateString(now);
  const selectedDateString = getDateString(props.selectedDate);
  const [board, setBoard] = useState(getMonthBoard(props.month.getFullYear(), props.month.getMonth() + 1));
  
  useEffect(() => {
    setBoard(getMonthBoard(props.month.getFullYear(), props.month.getMonth() + 1));
  }, [props.month]);

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
                const foundActivity = props.activities.find(a => a.startDateString <= dateString && a.endDateString >= dateString);
                const hasActivity = foundActivity && !foundActivity.custom[dateString]?.delete;
                return (
                  cell ? 
                  <TouchableWithoutFeedback key={`cell-${i}-${j}`} onPress={() => props.setSelectedDate(cell)}>
                    <View style={styles.cell}>
                      {selectedDateString === dateString ? <View style={styles.selected}>
                        <Text style={[styles.cellText, styles.selectedText]}>{cell.getDate()}</Text>
                        <View style={[styles.dot, { backgroundColor: hasActivity ? globalStyles.colors.green : 'transparent' }]}/>
                      </View>
                      : 
                      <>
                        <Text style={dateString < nowString ? { color: globalStyles.colors.gray } : styles.cellText}>{cell.getDate()}</Text>
                        <View style={[styles.dot, { backgroundColor: hasActivity ? globalStyles.colors.green : 'transparent' }]}/>
                      </>}
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 8,
    paddingBottom: 0,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toolbarIconStyle: {
    padding: 4,
  },
  board: {
    padding: 8,
  },
  weekDay: {
    fontSize: 10,
    padding: 3,
    textAlign: 'center',
    color: '#666',
  },
  row: {
    width: '100%',
  },
  cellText: {
    fontSize: 13,
  },
  cell: {
    flex: 1,
    aspectRatio: '1/1',
    maxHeight: 40,
    ...globalStyles.flexCenter,
  },
  selected: {
    backgroundColor: globalStyles.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 20,
    ...globalStyles.flexCenter,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dot: {
    width: 4,
    height: 4,
    marginTop: 2,
    borderRadius: 20,
  },
});

export default Calendar