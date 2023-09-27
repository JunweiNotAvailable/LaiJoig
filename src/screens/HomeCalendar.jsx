import { View, Text, StyleSheet } from 'react-native'
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import Calendar from './components/Calendar';
import ActivityList from './components/ActivityList';
import { useHomeState } from './context/HomeContext';

const HomeCalendar = ({ navigation, route }) => {
  let [fontsLoaded] = useFonts({
    'Logo': require('../../assets/fonts/OnelySans.ttf')
  });

  const props = useHomeState();

  return (
    <View style={styles.container}>
      <View style={styles.logobar}>
        <Text style={{ ...styles.logoText, fontFamily: fontsLoaded ? 'Logo' : '' }}>Laijoig</Text>
      </View>
      <View style={styles.shadowContainer}>
        <View style={styles.body}>
          <Calendar { ...props }/>
          <ActivityList { ...props }/>
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
  }
});

export default HomeCalendar