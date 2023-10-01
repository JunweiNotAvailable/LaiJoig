import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SignInUsername from './SignInUsername';
import SignInPassword from './SignInPassword';
import SignUp from './SignUp';
import { AuthStateProvider } from '../../context/AuthContext';

const Stack = createNativeStackNavigator();

const Auth = () => {
  return (
    <AuthStateProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='SignInUsername'>
        <Stack.Screen name='SignInUsername' component={SignInUsername}/>
        <Stack.Screen name='SignInPassword' component={SignInPassword}/>
        <Stack.Screen name='SignUp' component={SignUp}/>
      </Stack.Navigator>
    </AuthStateProvider>
  )
}

export default Auth