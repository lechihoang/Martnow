"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minus } from 'lucide-react';
import useUser from '@/hooks/useUser';
import EmojiInput from '@/components/ui/EmojiInput';

interface Message {
  id: number;
  userId: number;
  roomId: number;
  content: string;
  type: 'text' | 'image' | 'file';
  metadata: any;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  mediaFiles?: any[];
}

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
}

interface ChatWindowProps {
  room: ChatRoom;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  onClose,
  isMinimized,
  onToggleMinimize
}) => {
  const { user: currentUser } = useUser();
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

  useEffect(() => {
    if (room && !isMinimized) {
      loadMessages();
    }
  }, [room, isMinimized]);

  const loadMessages = async () => {
    if (!room) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/chat/rooms/${room.id}/messages`, {
        credentials: 'include',
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData.reverse());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !room || !currentUser || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

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
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
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

  const formatTime = (date: string) => {
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

  const getOtherParticipant = () => {
    if (!room.isPrivate || !currentUser) return null;
    return room.participants.find(p => p.id !== currentUser.id);
  };

  const otherParticipant = getOtherParticipant();
  const displayName = room.isPrivate && otherParticipant ? otherParticipant.name : room.name;
  const displayAvatar = room.isPrivate && otherParticipant ? otherParticipant.avatar : null;

  return (
    <div className="fixed bottom-6 right-24 w-80 bg-white rounded-lg shadow-2xl border z-30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-blue-500 text-white rounded-t-lg">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <img
            src={displayAvatar || '/images/default-avatar.png'}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="min-w-0">
            <h3 className="font-semibold truncate text-sm">{displayName}</h3>
            <p className="text-xs text-blue-100">Đang hoạt động</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-600 rounded-full transition-colors"
            title={isMinimized ? "Phóng to" : "Thu nhỏ"}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-blue-600 rounded-full transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area - Hidden when minimized */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 max-h-96 min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm text-center">Chưa có tin nhắn nào<br/>Hãy gửi tin nhắn đầu tiên!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.userId === currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="flex items-end space-x-2 max-w-[85%]">
                    {message.userId !== currentUser?.id && (
                      <img
                        src={message.user.avatar || '/images/default-avatar.png'}
                        alt={message.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          message.userId === currentUser?.id
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white text-gray-900 border rounded-bl-md'
                        }`}
                      >
                        {message.content}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-3 rounded-b-lg">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <EmojiInput
                  value={newMessage}
                  onChange={setNewMessage}
                  onKeyPress={handleKeyPress}
                  placeholder="Tin nhắn... 😊"
                  maxLength={500}
                  showEmojiButton={true}
                  className="bg-gray-100 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 border-none"
                  emojiButtonClassName="text-gray-400"
                  pickerClassName="z-[60]"
                  disabled={sending}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
