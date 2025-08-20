"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Users } from 'lucide-react';
import useUser from '@/hooks/useUser';

interface ChatIconProps {
  onToggleChat: () => void;
  isOpen: boolean;
  unreadCount?: number;
}

const ChatIcon: React.FC<ChatIconProps> = ({ 
  onToggleChat, 
  isOpen, 
  unreadCount = 0 
}) => {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(true);

  // Hide chat icon if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onToggleChat}
        className={`
          relative flex items-center justify-center w-14 h-14 rounded-full 
          bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl
          transition-all duration-200 transform hover:scale-105
          ${isOpen ? 'bg-gray-500 hover:bg-gray-600' : ''}
        `}
        title={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && !isOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
        
        {/* Online indicator */}
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
      </button>
    </div>
  );
};

export default ChatIcon;
