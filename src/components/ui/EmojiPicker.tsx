'use client';

import { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
  buttonClassName?: string;
  pickerClassName?: string;
  theme?: Theme;
}

export default function EmojiPickerComponent({ 
  onEmojiSelect, 
  buttonClassName = '',
  pickerClassName = '',
  theme = Theme.AUTO
}: EmojiPickerComponentProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`
          flex items-center justify-center p-2 rounded-md border border-gray-300 
          hover:border-orange-400 hover:bg-orange-50 transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
          ${buttonClassName}
        `}
        title="Thêm emoji"
      >
        <span className="text-xl">😊</span>
      </button>

      {showPicker && (
        <div 
          ref={pickerRef}
          className={`
            absolute z-50 mb-2 right-0
            bg-white border border-gray-200 rounded-lg shadow-lg
            ${pickerClassName}
          `}
          style={{
            // Position picker above the button
            right: 0,
            bottom: '100%'
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={theme}
            width={320}
            height={400}
            searchDisabled={false}
            skinTonePickerDisabled={false}
            previewConfig={{
              defaultEmoji: '1f60a',
              defaultCaption: 'Chọn emoji!',
              showPreview: true
            }}
          />
        </div>
      )}
    </div>
  );
}

// Hook for emoji utilities
export const useEmoji = () => {
  // Function to check if text contains emoji
  const hasEmoji = (text: string): boolean => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    return emojiRegex.test(text);
  };

  // Function to count emojis in text
  const countEmojis = (text: string): number => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const matches = text.match(emojiRegex);
    return matches ? matches.length : 0;
  };

  // Function to remove emojis from text
  const removeEmojis = (text: string): string => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    return text.replace(emojiRegex, '');
  };

  // Function to extract emojis from text
  const extractEmojis = (text: string): string[] => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const matches = text.match(emojiRegex);
    return matches || [];
  };

  return {
    hasEmoji,
    countEmojis,
    removeEmojis,
    extractEmojis
  };
};
