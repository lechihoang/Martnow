"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import useUser from '@/hooks/useUser';

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

interface ChatListProps {
  onSelectChat: (room: ChatRoom) => void;
  selectedRoomId?: number;
  onClose: () => void;
}

const ChatList: React.FC<ChatListProps> = ({
  onSelectChat,
  selectedRoomId,
  onClose
}) => {
  const { user } = useUser();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserRooms();
    }
  }, [user]);

  const fetchUserRooms = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('http://localhost:3001/chat/rooms', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const roomsData = await response.json();
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatLastMessageTime = (date: string) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ`;
    } else {
      return msgDate.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (room: ChatRoom) => {
    if (!room.isPrivate) return null;
    return room.participants.find(p => p.id !== user?.id);
  };

  const truncateMessage = (content: string, maxLength: number = 30) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-2xl border z-40 max-h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-900">Đoạn chat</h3>
        <div className="flex items-center space-x-2">
          <button
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full"
            title="Tùy chọn"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trong Messenger"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto max-h-64">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const otherParticipant = getOtherParticipant(room);
            const displayName = room.isPrivate && otherParticipant ? otherParticipant.name : room.name;
            const displayAvatar = room.isPrivate && otherParticipant ? otherParticipant.avatar : null;
            
            return (
              <div
                key={room.id}
                onClick={() => onSelectChat(room)}
                className={`
                  flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors
                  ${selectedRoomId === room.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}
                `}
              >
                {/* Avatar */}
                <div className="relative mr-3">
                  <img
                    src={displayAvatar || '/images/default-avatar.png'}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {displayName}
                    </h4>
                    {room.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatLastMessageTime(room.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {room.lastMessage ? (
                    <p className="text-sm text-gray-600 truncate">
                      {room.lastMessage.user.id === user?.id ? 'Bạn: ' : ''}
                      {truncateMessage(room.lastMessage.content)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Chưa có tin nhắn</p>
                  )}
                </div>

                {/* Unread indicator (placeholder) */}
                <div className="w-3 h-3 bg-blue-500 rounded-full ml-2 opacity-0"></div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t bg-gray-50 rounded-b-lg">
        <button 
          onClick={onClose}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Xem tất cả trong Messenger
        </button>
      </div>
    </div>
  );
};

export default ChatList;
