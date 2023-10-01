import React, { createContext, useContext, useState } from 'react';
import { useAppState } from './AppContext';

// Create a context
const HomeStateContext = createContext();

// Create a provider component
export const HomeStateProvider = ({ children }) => {

  // time
  const now = new Date();
  const [month, setMonth] = useState(now);
  const [selectedDate, setSelectedDate] = useState(now);
  const [loaded, setLoaded] = useState([]);
  // data
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);

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