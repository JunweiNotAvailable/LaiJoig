import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from "./src/screens/Main";
import Splash from "./src/screens/Splash";
import { AppStateProvider } from "./src/context/AppContext";
import Auth from "./src/screens/Auth/Auth";
import { UtilStateProvider } from "./src/context/UtilContext";
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  })
});
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

const Stack = createNativeStackNavigator();

const App = () => {
  
  return (
    <AppStateProvider>
      <UtilStateProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{
            headerShown: false
          }}>
            <Stack.Screen name="Splash" component={Splash}/>
            <Stack.Screen name="Main" component={Main}/>
            <Stack.Screen name="Auth" component={Auth}/>
          </Stack.Navigator>
        </NavigationContainer>
      </UtilStateProvider>
    </AppStateProvider>
  );
}


export default App;