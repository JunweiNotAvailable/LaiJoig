import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from "./src/screens/Main";
import Splash from "./src/screens/Splash";
import { AppStateProvider, useAppState } from "./src/context/AppContext";
import Auth from "./src/screens/Auth/Auth";
import { UtilStateProvider } from "./src/context/UtilContext";
import axios from "axios";

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