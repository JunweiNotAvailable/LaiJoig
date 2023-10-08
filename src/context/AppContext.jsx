import React, { useRef, useEffect, createContext, useContext, useState } from 'react';
import { getImageUrl } from '../utils/Functions';
import axios from 'axios';
import config from '../../config.json';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a context
const AppStateContext = createContext();

// Create a provider component
export const AppStateProvider = ({ children }) => {
  
  // useEffect(() => {
  //   (async () => {
  //     const data = (await axios.get(`${config.api}/access-items`, {params: {
  //       table: 'Laijoig-Activities',
  //       filter: '',
  //     }})).data;
  //     console.log(data);
  //     for (const a of data) {
  //       if (a.userId === '張涵柔') {
  //         const na = {
  //           ...a,
  //           userId: 'hzzzzz._.',
  //         }
  //         await axios.post(`${config.api}/access-item`, {
  //           table: 'Laijoig-Activities',
  //           data: na
  //         })
  //         console.log('done')
  //       }
  //     }
  //   })();
  // }, []);


  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [urls, setUrls] = useState({});
  const [preference, setPreference] = useState({});
  const [notifications, setNotifications] = useState([]);
  // notification data
  const [receivedComment, setReceivedComment] = useState(null);
  const [goToNotifications, setGoToNotifications] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  // listening to notifications
  useEffect(() => {

    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      // load data from database when recieved notification
      const commentId = notification.request.content.data.commentId;
      const messageId = notification.request.content.data.messageId;
      if (commentId) { // if it's comment
        const comment = (await axios.get(`${config.api}/access-item`, {params: {
          table: 'Laijoig-Comments',
          id: commentId
        }})).data.Item;
        setReceivedComment(comment);
      } else if (messageId) { // if it's message

      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      // load data from database when recieved notification
      const commentId = response.notification.request.content.data.commentId;
      const messageId = response.notification.request.content.data.messageId;
      if (commentId) { // if it's comment
        const comment = (await axios.get(`${config.api}/access-item`, {params: {
          table: 'Laijoig-Comments',
          id: commentId
        }})).data.Item;
        setReceivedComment(comment);
        setGoToNotifications(response.notification.request.identifier);
      } else if (messageId) { // if it's message
        
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // load data
  useEffect(() => {
    (async () => {
      // preference
      setPreference({
        loadingIcon: await AsyncStorage.getItem('loadingIcon') || 'normal',
        chatTheme: await AsyncStorage.getItem('chatTheme') || 'normal',
      });
      // notificaitons
      const data = (await axios.get(`${config.api}/access-items`, {params: {
        table: 'Laijoig-Notifications',
        filter: ''
      }})).data;
      setNotifications(data);
    })();
  }, []);
  
  useEffect(() => {
    (async () => {
      let newUrls = {};
      for (const u of users) {
        // console.log(u.url)
        const url = await getImageUrl('laijoig-bucket', u.url);
        // console.log(url)
        newUrls[u.id] = url;
      }
      setUrls(newUrls);
    })();
  }, [users]);
  
  useEffect(() => {
    if (user) {
      (async () => {
        // const newUsers = [];
        // for (const id of user.bosom) {
        //   const newUser = (await axios.get(`${config.api}/access-item`, {params: {
        //     table: 'Laijoig-Users',
        //     id: id
        //   }})).data.Item;
        //   newUsers.push(newUser);
        // }
        // setUsers([...newUsers, user]);
        const newUsers = (await axios.get(`${config.api}/access-items`, {params: {
          table: 'Laijoig-Users',
          filter: ''
        }})).data;
        setUsers(newUsers);
      })();
    }
  }, [user]);
  

  return (
    <AppStateContext.Provider value={{ 
      user, setUser,
      users, setUsers,
      group, setGroup,
      groups, setGroups,
      urls, setUrls,
      preference, setPreference,
      receivedComment, setReceivedComment,
      goToNotifications, setGoToNotifications,
      notifications, setNotifications,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useAppState = () => {
  return useContext(AppStateContext);
};