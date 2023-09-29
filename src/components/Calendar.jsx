import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import Button from './Button';
import { Entypo } from '@expo/vector-icons';
import { globalStyles } from '../utils/Constants';
import { getDateString, getMonthBoard } from '../utils/Functions';

const Calendar = ( props ) => {
  const now = new Date();
  const nowString = getDateString(now);
  const selectedString = getDateString(props.selectedDate);
  const [board, setBoard] = useState(getMonthBoard(props.month.getFullYear(), props.month.getMonth() + 1));
  
  useEffect(() => {
    setBoard(getMonthBoard(props.month.getFullYear(), props.month.getMonth() + 1));
  }, [props.month]);

  return (
    <View style={styles.container}>
      {/* toolbar */}
      <View style={styles.toolbar}>
        <Button 
          icon={<Entypo name="chevron-thin-left" size={18} style={styles.toolbarIconStyle}/>}
          onPress={() => {
            const newDate = new Date(props.month);
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() - 1);
            props.setMonth(newDate);
          }}
        />
        <Text style={[globalStyles.bold]}>{getDateString(props.month).slice(0, 7).replace('-', ' / ')}</Text>
        <Button 
          icon={<Entypo name="chevron-thin-right" size={18} style={styles.toolbarIconStyle}/>}
          onPress={() => {
            const newDate = new Date(props.month);
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() + 1);
            props.setMonth(newDate);
          }}
        />
      </View>
      {/* board */}
      <View style={styles.board}>
        {board.map((row, i) => {
          return (
            <View style={[globalStyles.flexRow, styles.row]} key={`row-${i}`}>
              {row.map((cell, j) => {
                const dateString = cell ? getDateString(cell) : '';
                return (
                  cell ? 
                  <TouchableWithoutFeedback key={`cell-${i}-${j}`} onPress={() => props.setSelectedDate(cell)}>
                    <View style={styles.cell}>
                      {selectedString === dateString ? <View style={styles.selected}>
                        <Text style={[styles.cellText, styles.selectedText]}>{cell.getDate()}</Text>
                        <View style={[styles.dot, { backgroundColor: globalStyles.colors.green }]}/>
                      </View>
                      : 
                      <>
                        <Text style={dateString < nowString ? { color: globalStyles.colors.gray } : styles.cellText}>{cell.getDate()}</Text>
                        <View style={[styles.dot, { backgroundColor: globalStyles.colors.green }]}/>
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
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolbarIconStyle: {
    padding: 4,
  },
  board: {
    padding: 8,
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