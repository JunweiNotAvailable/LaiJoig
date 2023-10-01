import React, { createContext, useContext, useState } from 'react';

// Create a context
const UtilStateContext = createContext();

// Create a provider component
export const UtilStateProvider = ({ children }) => {

  const [trigger, setTrigger] = useState(false);

  return (
    <UtilStateContext.Provider value={{
      trigger, setTrigger,
    }}>
      {children}
    </UtilStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useUtilState = () => {
  return useContext(UtilStateContext);
};