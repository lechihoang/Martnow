"use client";
import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '@/lib/api';

export interface MessageUser {
  id: number;
  name: string;
  username: string;
  avatar?: string;
}

export interface Message {
  id: number;
  userId: number;
  roomId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  metadata?: any;
  createdAt: string;
  user: MessageUser;
  mediaFiles?: any[];
}

export interface Room {
  id: number;
  name: string;
  isPrivate: boolean;
  createdAt: string;
  participants: MessageUser[];
  lastMessage?: {
    id: number;
    content: string;
    type: string;
    createdAt: string;
    user: MessageUser;
  };
}

interface UseMessagesReturn {
  rooms: Room[];
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  getUserRooms: () => Promise<void>;
  getRoomMessages: (roomId: number) => Promise<void>;
  startPrivateChat: (userId: number) => Promise<Room>;
  refreshRooms: () => Promise<void>;
}

const useMessages = (): UseMessagesReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's chat rooms
  const getUserRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await chatApi.getRooms(1, 50);
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get messages for a specific room
  const getRoomMessages = useCallback(async (roomId: number) => {
    try {
      setError(null);

      const data = await chatApi.getRoomMessages(roomId, 1, 100);
      setMessages(data.reverse()); // Reverse to show oldest first
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  }, []);

  // Start a private chat with another user
  const startPrivateChat = useCallback(async (userId: number): Promise<Room> => {
    try {
      setError(null);

      const room = await chatApi.startPrivateChat(userId);

      // Refresh rooms to include the new room
      await getUserRooms();

      return room;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getUserRooms]);

  // Refresh rooms
  const refreshRooms = useCallback(async () => {
    await getUserRooms();
  }, [getUserRooms]);

  // Load rooms on mount
  useEffect(() => {
    getUserRooms();
  }, [getUserRooms]);

  // Calculate unread count (simplified version)
  const unreadCount = rooms.reduce((count, room) => {
    // This is a simplified calculation
    // In a real app, you'd track read/unread status per user per room
    if (room.lastMessage) {
      const lastMessageTime = new Date(room.lastMessage.createdAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Consider recent messages as potentially unread
      if (lastMessageTime > oneHourAgo) {
        return count + 1;
      }
    }
    return count;
  }, 0);

  return {
    rooms,
    messages,
    unreadCount,
    loading,
    error,
    getUserRooms,
    getRoomMessages,
    startPrivateChat,
    refreshRooms,
  };
};

export default useMessages;
