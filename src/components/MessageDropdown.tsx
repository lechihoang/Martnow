"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MessageIcon from './MessageIcon';
import useMessages, { Room } from '@/hooks/useMessages';

interface MessageDropdownProps {
  onRoomClick?: (roomId: number) => void;
}

const MessageDropdown: React.FC<MessageDropdownProps> = ({
  onRoomClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { rooms, unreadCount, loading, error } = useMessages();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // < 1 phút
      return 'Vừa xong';
    } else if (diff < 3600000) { // < 1 giờ
      return `${Math.floor(diff / 60000)} phút trước`;
    } else if (diff < 86400000) { // < 1 ngày
      return `${Math.floor(diff / 3600000)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const handleRoomClick = (roomId: number) => {
    onRoomClick?.(roomId);
    router.push(`/messages/${roomId}`);
    setIsOpen(false);
  };

  const handleViewAllMessages = () => {
    router.push('/messages');
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="relative" ref={ref}>
        <MessageIcon
          onClick={() => setIsOpen(!isOpen)}
          messageCount={0}
        />
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <MessageIcon
        onClick={() => setIsOpen(!isOpen)}
        messageCount={unreadCount}
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Tin nhắn</h3>
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-4 py-3 text-sm text-red-600 border-b">
              {error}
            </div>
          )}

          {/* Rooms List */}
          <div className="max-h-96 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleRoomClick(room.id)}
                  className="px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar - for private rooms, show other participant's avatar */}
                    <img
                      src={
                        room.isPrivate && room.participants.length > 1
                          ? room.participants.find(p => p.name !== room.name)?.avatar || '/default-avatar.jpg'
                          : '/default-avatar.jpg'
                      }
                      alt={room.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {room.name}
                        </p>
                        {room.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(room.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {room.lastMessage ? (
                        <p className="text-sm text-gray-600 truncate">
                          {room.lastMessage.user.name}: {room.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Chưa có tin nhắn
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {rooms.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50">
              <button
                onClick={handleViewAllMessages}
                className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả cuộc trò chuyện
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageDropdown;
