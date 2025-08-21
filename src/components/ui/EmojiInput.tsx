'use client';

import { forwardRef, useState, useRef, useImperativeHandle } from 'react';
import EmojiPickerComponent, { useEmoji } from './EmojiPicker';
import { Theme } from 'emoji-picker-react';

interface EmojiInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  showEmojiButton?: boolean;
  emojiButtonClassName?: string;
  pickerClassName?: string;
  label?: string;
  error?: string;
  required?: boolean;
  theme?: Theme;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export interface EmojiInputRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}
const EmojiInput = forwardRef<EmojiInputRef, EmojiInputProps>(({ 
  value,
  onChange,
  placeholder = "Nhập văn bản...",
  className = "",
  disabled = false,
  maxLength,
  showEmojiButton = true,
  emojiButtonClassName = "",
  pickerClassName = "",
  label,
  error,
  required = false,
  theme = Theme.AUTO,
  onKeyPress
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const { hasEmoji, countEmojis } = useEmoji();

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    getValue: () => value,
    setValue: (newValue: string) => onChange(newValue)
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Apply maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    onChange(newValue);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (!inputRef.current) return;
    
    const input = inputRef.current;
    const start = input.selectionStart || cursorPosition;
    const end = input.selectionEnd || cursorPosition;
    
    // Insert emoji at cursor position
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    
    // Apply maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    onChange(newValue);
    
    // Set cursor position after emoji
    setTimeout(() => {
      const newPosition = start + emoji.length;
      input.setSelectionRange(newPosition, newPosition);
      input.focus();
    }, 10);
  };

  const handleInputClick = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  const handleKeyUp = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyUp={handleKeyUp}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${showEmojiButton ? 'pr-12' : ''}
            ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''}
            ${className}
          `}
        />
        
        {showEmojiButton && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <EmojiPickerComponent
              onEmojiSelect={handleEmojiSelect}
              buttonClassName={`
                p-1 text-sm hover:bg-orange-100 border-none
                ${emojiButtonClassName}
              `}
              pickerClassName={pickerClassName}
              theme={theme}
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-1">
        <div>
          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
          {hasEmoji(value) && (
            <span className="text-xs text-gray-500">
              {countEmojis(value)} emoji
            </span>
          )}
        </div>
        
        {maxLength && (
          <span className={`text-xs ${value.length > maxLength * 0.8 ? 'text-orange-600' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

EmojiInput.displayName = 'EmojiInput';

export default EmojiInput;
