"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChatIcon from './ChatIcon';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import useUser from '@/hooks/useUser';
import { useChatContext } from '@/contexts/ChatContext';

interface ChatRoom {
  id: number;
  name: string;
  isPrivate: boolean;
  createdAt: string;
  participants: Array<{
    id: number;
    name: string;
    username: string;
    avatar?: string;
  }>;
  lastMessage?: {
    id: number;
    content: string;
    type: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
      username: string;
    };
  };
}

interface ChatSystemProps {
  initialTargetUserId?: number; // For opening chat directly with a user
}

const ChatSystem: React.FC<ChatSystemProps> = ({ initialTargetUserId }) => {
  const { user } = useUser();
  const { setStartChatWithUser } = useChatContext();
  const [showChatList, setShowChatList] = useState(false);
  const [openChats, setOpenChats] = useState<ChatRoom[]>([]);
  const [minimizedChats, setMinimizedChats] = useState<Set<number>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const initialTargetUserProcessed = useRef(false);

  const startChatWithUser = useCallback(async (targetUserId: number) => {
    if (!user) return;

    try {
      // Create or get existing private chat
      const response = await fetch('http://localhost:3001/chat/private', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (response.ok) {
        const room = await response.json();
        
        // Check if we already have this chat open
        setOpenChats(prev => {
          const isAlreadyOpen = prev.some(chat => chat.id === room.id);
          if (isAlreadyOpen) {
            // If it's already open but minimized, maximize it
            setMinimizedChats(currentMinimized => {
              if (currentMinimized.has(room.id)) {
                const newSet = new Set(currentMinimized);
                newSet.delete(room.id);
                return newSet;
              }
              return currentMinimized;
            });
            return prev;
          }
          return [...prev, room];
        });
        
        // Hide chat list
        setShowChatList(false);
      }
    } catch (error) {
      console.error('Error starting chat with user:', error);
    }
  }, [user]);

  // Set up context connection only once
  useEffect(() => {
    setStartChatWithUser(startChatWithUser);
  }, [setStartChatWithUser]); // Remove startChatWithUser from deps to prevent infinite loop

  // Handle initial target user
  useEffect(() => {
    if (initialTargetUserId && user && !initialTargetUserProcessed.current) {
      initialTargetUserProcessed.current = true;
      startChatWithUser(initialTargetUserId);
    }
  }, [initialTargetUserId, user]); // Remove startChatWithUser from deps

  const toggleChatList = () => {
    setShowChatList(!showChatList);
  };

  const toggleMinimizeChat = useCallback((roomId: number) => {
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  }, []);

  const selectChat = (room: ChatRoom) => {
    // Add to open chats if not already open
    setOpenChats(prev => {
      const isAlreadyOpen = prev.some(chat => chat.id === room.id);
      return isAlreadyOpen ? prev : [...prev, room];
    });
    
    // If chat was minimized, maximize it
    if (minimizedChats.has(room.id)) {
      toggleMinimizeChat(room.id);
    }
    
    setShowChatList(false);
  };

  const closeChat = (roomId: number) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== roomId));
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(roomId);
      return newSet;
    });
  };


  const closeChatList = () => {
    setShowChatList(false);
  };

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Chat Icon */}
      <ChatIcon
        onToggleChat={toggleChatList}
        isOpen={showChatList}
        unreadCount={unreadCount}
      />

      {/* Chat List */}
      {showChatList && (
        <ChatList
          onSelectChat={selectChat}
          selectedRoomId={undefined}
          onClose={closeChatList}
        />
      )}

      {/* Open Chat Windows */}
      {openChats.map((room, index) => (
        <div
          key={room.id}
          style={{
            right: `${96 + (index * 320)}px`, // Position each chat window to the left of the previous
          }}
          className="fixed bottom-6"
        >
          <ChatWindow
            room={room}
            onClose={() => closeChat(room.id)}
            isMinimized={minimizedChats.has(room.id)}
            onToggleMinimize={() => toggleMinimizeChat(room.id)}
          />
        </div>
      ))}
    </>
  );
};

// Helper hook to expose chat functionality to other components
export const useChatSystem = () => {
  const [chatSystem, setChatSystem] = useState<{
    startChatWithUser: (userId: number) => void;
  } | null>(null);

  return {
    chatSystem,
    setChatSystem,
  };
};

export default ChatSystem;
