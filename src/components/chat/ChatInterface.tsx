"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';
import { UserResponseDto } from '@/types/dtos';
import useUser from '@/hooks/useUser';
import EmojiInput from '@/components/ui/EmojiInput';

interface Message {
  id: number;
  userId: number;
  roomId: number;
  content: string;
  type: 'text' | 'image' | 'file';
  metadata: any;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  mediaFiles?: any[];
}

interface Room {
  id: number;
  name: string;
  isPrivate: boolean;
  createdAt: Date;
  participants: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
}

interface ChatInterfaceProps {
  targetUser: UserResponseDto;
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  targetUser,
  isOpen,
  onClose
}) => {
  const { user: currentUser } = useUser();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start or get existing private chat
  useEffect(() => {
    if (isOpen && currentUser && targetUser) {
      startPrivateChat();
    }
  }, [isOpen, currentUser, targetUser]);

  const startPrivateChat = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/chat/private', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId: targetUser.id }),
      });

      if (response.ok) {
        const roomData = await response.json();
        setRoom(roomData);
        await loadMessages(roomData.id);
      } else {
        console.error('Failed to start private chat');
      }
    } catch (error) {
      console.error('Error starting private chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/chat/rooms/${roomId}/messages`, {
        credentials: 'include',
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData.reverse()); // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !room || !currentUser || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage(''); // Clear input immediately

    try {
      const response = await fetch('http://localhost:3001/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          roomId: room.id,
          content: messageContent,
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
      } else {
        console.error('Failed to send message');
        setNewMessage(messageContent); // Restore message on failure
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return messageDate.toLocaleDateString('vi-VN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={targetUser.avatar || '/images/default-avatar.png'}
              alt={targetUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{targetUser.name}</h3>
              <p className="text-sm text-gray-500">@{targetUser.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <User className="w-12 h-12 mb-2" />
              <p>Chưa có tin nhắn nào</p>
              <p className="text-sm">Hãy gửi tin nhắn đầu tiên!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.userId === currentUser?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.userId === currentUser?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.userId === currentUser?.id
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <EmojiInput
                value={newMessage}
                onChange={setNewMessage}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn... 😊"
                maxLength={500}
                showEmojiButton={true}
                className="chat-input"
                emojiButtonClassName="text-gray-400"
                pickerClassName="z-[60]"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Gửi tin nhắn"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
