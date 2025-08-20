"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface MessageIconProps {
  onClick?: () => void;
  messageCount?: number;
  className?: string;
}

const MessageIcon: React.FC<MessageIconProps> = ({ 
  onClick, 
  messageCount = 0, 
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      {messageCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {messageCount > 99 ? '99+' : messageCount}
        </span>
      )}
    </button>
  );
};

export default MessageIcon;
