import { View, Text, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native'
import React, { useState, useEffect } from 'react';
import { globalStyles } from '../utils/Constants';
import Button from './Button';
import { getDateString, getMonthBoard } from '../utils/Functions';
import { Entypo } from '@expo/vector-icons';

const DatePicker = ( props ) => {

  const [minDate, setMinDate] = useState(props.picking === 'end' ? props.startDate : props.minDate || new Date('2001-10-23'));
  const [maxDate, setMaxDate] = useState(!props.maxDate ? props.picking === 'end' ? getDatePlus30(props.startDate) : new Date('9999-12-31') : props.maxDate);
  const [month, setMonth] = useState(props.picking === 'start' ? props.startDate : props.endDate);
  const [board, setBoard] = useState(getMonthBoard(month.getFullYear(), month.getMonth() + 1));

  useEffect(() => {
    setBoard(getMonthBoard(month.getFullYear(), month.getMonth() + 1));
  }, [month]);

  // close picker or pick date
  const handleClick = (item) => {
    if (item === 'background') {
      props.setPicking('');
      return;
    }
    if (item === 'picker' || (item < getDateString(minDate)) || item > getDateString(maxDate)) return;
    if (props.picking === 'start') {
      props.setStartDate(new Date(item));
    } else {
      props.setEndDate(new Date(item));
    }
    props.setPicking('');
  }



  return (
    <TouchableWithoutFeedback onPress={() => handleClick('background')}>
      <View style={styles.container}>
        <View style={styles.containerShadow}>
          {/* picker */}
          <TouchableWithoutFeedback onPress={() => handleClick('picker')}>
            <View style={styles.picker}>
              <View style={styles.toolbar}>
                <Button 
                  icon={<Entypo name="chevron-left" size={18} style={styles.toolbarIconStyle}/>}
                  onPress={() => {
                    const newDate = new Date(month);
                    newDate.setDate(1);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setMonth(newDate);
                  }}
                />
                <Text style={[globalStyles.bold]}>{getDateString(month).slice(0, 7).replace('-', '/')}</Text>
                <Button 
                  icon={<Entypo name="chevron-right" size={18} style={styles.toolbarIconStyle}/>}
                  onPress={() => {
                    const newDate = new Date(month);
                    newDate.setDate(1);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setMonth(newDate);
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
                          <TouchableWithoutFeedback key={`cell-${i}-${j}`} onPress={() => handleClick(dateString)}>
                            <View style={styles.cell}>
                              {dateString >= getDateString(minDate) && dateString <= getDateString(maxDate) ? 
                              // selected
                              dateString === (props.picking === 'start' ? getDateString(props.startDate) : getDateString(props.endDate)) ? <View style={styles.selected}>
                                <Text style={[styles.cellText, styles.selectedText]}>{cell.getDate()}</Text>
                              </View>
                              : 
                              // normal
                              <Text style={styles.cellText}>{cell.getDate()}</Text>
                              : 
                              // disabled
                              <Text style={[styles.cellText, { color: globalStyles.colors.gray }]}>{cell.getDate()}</Text>}
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
          </TouchableWithoutFeedback>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  containerShadow: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: .3,
    shadowRadius: 5,
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
  },
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ...globalStyles.flexCenter,
  },
  picker: {
    elevation: 3,
    width: '90%',
    padding: 8,
    backgroundColor: '#fff',
    borderWidth: .8,
    borderColor: '#ccc',
    borderRadius: 16,
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
    marginTop: 8,
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
});

const getDatePlus30 = (date) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 30);
  return newDate;
}

export default DatePicker