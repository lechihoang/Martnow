"use client";

import React, { createContext, useContext, useRef, ReactNode, useCallback } from 'react';

interface ChatContextType {
  startChatWithUser: (userId: number) => void;
  setStartChatWithUser: (fn: (userId: number) => void) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const startChatWithUserRef = useRef<(userId: number) => void>(() => {
    console.warn('Chat system not initialized yet');
  });

  const startChatWithUser = useCallback((userId: number) => {
    startChatWithUserRef.current(userId);
  }, []);

  const setStartChatWithUser = useCallback((fn: (userId: number) => void) => {
    startChatWithUserRef.current = fn;
  }, []);

  return (
    <ChatContext.Provider value={{
      startChatWithUser,
      setStartChatWithUser,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
