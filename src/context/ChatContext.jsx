import React, { useEffect, createContext, useContext, useState } from 'react';

// Create a context
const ChatStateContext = createContext();

// Create a provider component
export const ChatStateProvider = ({ children }) => {

  const [messages, setMessages] = useState([]);

  return (
    <ChatStateContext.Provider value={{ 
      messages, setMessages,
    }}>
      {children}
    </ChatStateContext.Provider>
  );
};

// Custom hook to access the context values
export const useChatState = () => {
  return useContext(ChatStateContext);
};