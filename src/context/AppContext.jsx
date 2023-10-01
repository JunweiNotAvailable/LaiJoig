import React, { createContext, useContext, useState } from 'react';

// Create a context
const AppStateContext = createContext();

// Create a provider component
export const AppStateProvider = ({ children }) => {

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);

  return (
    <AppStateContext.Provider value={{ 
      user, setUser,
      users, setUsers,
      group, setGroup,
      groups, setGroups
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useAppState = () => {
  return useContext(AppStateContext);
};