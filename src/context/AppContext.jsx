import React, { useEffect, createContext, useContext, useState } from 'react';
import { getImageUrl } from '../utils/Functions';
import axios from 'axios';
import config from '../../config.json';

// Create a context
const AppStateContext = createContext();

// Create a provider component
export const AppStateProvider = ({ children }) => {

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [urls, setUrls] = useState({});

  useEffect(() => {
    (async () => {
      let newUrls = {};
      for (const u of users) {
        const url = await getImageUrl('laijoig-bucket', u.url);
        newUrls[u.id] = url;
      }
      setUrls(newUrls);
    })();
  }, [users]);
  
  useEffect(() => {
    if (user) {
      (async () => {
        const newUsers = [];
        for (const id of user.bosom) {
          const newUser = (await axios.get(`${config.api}/access-item`, {params: {
            table: 'Laijoig-Users',
            id: id
          }})).data.Item;
          newUsers.push(newUser);
        }
        setUsers([...newUsers, user]);
      })();
    }
  }, [user]);
  

  return (
    <AppStateContext.Provider value={{ 
      user, setUser,
      users, setUsers,
      group, setGroup,
      groups, setGroups,
      urls, setUrls
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useAppState = () => {
  return useContext(AppStateContext);
};