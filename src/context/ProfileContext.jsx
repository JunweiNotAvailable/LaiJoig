import React, { createContext, useContext, useState } from 'react';
import { useAppState } from './AppContext';

// Create a context
const ProfileStateContext = createContext();

// Create a provider component
export const ProfileStateProvider = ({ children }) => {

  return (
    <ProfileStateContext.Provider value={{
      
    }}>
      {children}
    </ProfileStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useProfileState = () => {
  return useContext(ProfileStateContext);
};