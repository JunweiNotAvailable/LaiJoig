import React, { createContext, useContext, useState } from 'react';

// Create a context
const AuthStateContext = createContext();

// Create a provider component
export const AuthStateProvider = ({ children }) => {

  const [userId, setUserId] = useState('');

  return (
    <AuthStateContext.Provider value={{ 
      userId, setUserId,
    }}>
      {children}
    </AuthStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useAuthState = () => {
  return useContext(AuthStateContext);
};