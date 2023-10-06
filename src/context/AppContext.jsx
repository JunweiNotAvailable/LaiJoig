import React, { useRef, useEffect, createContext, useContext, useState } from 'react';
import { getImageUrl } from '../utils/Functions';
import axios from 'axios';
import config from '../../config.json';
import * as Notifications from 'expo-notifications';

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
  //       if (a.userId === '友誼') {
  //         const na = {
  //           ...a,
  //           userId: 'Uz.zzi_',
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
  const [notifications, setNotifications] = useState([]);
  // notification data
  const [receivedComment, setReceivedComment] = useState(null);
  const [goToNotifications, setGoToNotifications] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  // listening to notifications
  useEffect(() => {

    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      // load comment from database when recieved notification
      const commentId = notification.request.content.data.commentId;
      const comment = (await axios.get(`${config.api}/access-item`, {params: {
        table: 'Laijoig-Comments',
        id: commentId
      }})).data.Item;
      setReceivedComment(comment);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      // load comment from database when recieved notification
      const commentId = response.notification.request.content.data.commentId;
      const comment = (await axios.get(`${config.api}/access-item`, {params: {
        table: 'Laijoig-Comments',
        id: commentId
      }})).data.Item;
      setReceivedComment(comment);
      setGoToNotifications(response.notification.request.identifier);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // load data
  useEffect(() => {
    (async () => {
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