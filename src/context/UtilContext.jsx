import React, { createContext, useContext, useState } from 'react';

// Create a context
const UtilStateContext = createContext();

// Create a provider component
export const UtilStateProvider = ({ children }) => {

  const [trigger, setTrigger] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(null);
  const [isDoubleClick, setIsDoubleClick] = useState(false);

  return (
    <UtilStateContext.Provider value={{
      trigger, setTrigger,
      lastClickTime, setLastClickTime,
      isDoubleClick, setIsDoubleClick,
    }}>
      {children}
    </UtilStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useUtilState = () => {
  return useContext(UtilStateContext);
};