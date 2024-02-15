import React, { useEffect, createContext, useContext, useState } from 'react';
import { getDateString } from '../utils/Functions';
import { useAppState } from './AppContext';
import { useNavigation } from '@react-navigation/native';
import { config } from '../utils/config';
import axios from 'axios';

// Create a context
const HomeStateContext = createContext();

// Create a provider component
export const HomeStateProvider = ({ children }) => {

  const appProps = useAppState();
  const navigation = useNavigation();
  // time
  const now = new Date();
  const [month, setMonth] = useState(now);
  const [selectedDate, setSelectedDate] = useState(now);
  const [loaded, setLoaded] = useState([]);
  // data
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setMonth(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const monthStr = getDateString(month).slice(0, 7);
    // load data
    async function loadData() {
      // load activities
      const activitiesRes = await axios.get(`${config.api.general}/access-items`, { params: {
        table: 'Laijoig-Activities',
        filter: 'dateRange',
        id: appProps.group.id,
        month: monthStr,
      }});
      // load comments
      const commentsRes = await axios.get(`${config.api.general}/access-items`, { params: {
        table: 'Laijoig-Comments',
        filter: 'date',
        id: appProps.group.id,
        month: monthStr
      }});
      // update
      const compatActivities = [ ...activities, ...activitiesRes.data ];
      const compatComments = [ ...comments, ...commentsRes.data ];
      setActivities(Array.from(new Set(compatActivities.map(a => a.id))).map(id => compatActivities.find(a => a.id === id)));
      setComments(Array.from(new Set(compatComments.map(t => t.id))).map(id => compatComments.find(t => t.id === id)));
      setLoaded([...loaded, monthStr]);
    }
    if (!loaded.includes(monthStr)) {
      loadData();
    }
  }, [month]);

  // change state when received notification data
  useEffect(() => {
    if (appProps.receivedComment) {
      const compatComments = [...comments, appProps.receivedComment];
      setComments(Array.from(new Set(compatComments.map(t => t.id))).map(id => compatComments.find(t => t.id === id)));
    }
  }, [appProps.receivedComment]);

  return (
    <HomeStateContext.Provider value={{
      month, setMonth,
      selectedDate, setSelectedDate,
      activities, setActivities,
      comments, setComments,
      loaded, setLoaded,
    }}>
      {children}
    </HomeStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useHomeState = () => {
  return useContext(HomeStateContext);
};