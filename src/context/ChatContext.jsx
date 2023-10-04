import React, { useEffect, createContext, useContext, useState } from 'react';
import { getImageUrl } from '../utils/Functions';
import axios from 'axios';
import config from '../../config.json';

// Create a context
const ChatStateContext = createContext();

// Create a provider component
export const ChatStateProvider = ({ children }) => {

  return (
    <ChatStateContext.Provider value={{ 
      
    }}>
      {children}
    </ChatStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useChatState = () => {
  return useContext(ChatStateContext);
};