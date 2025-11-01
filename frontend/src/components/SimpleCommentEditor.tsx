'use client';

import React, { useState, useRef } from 'react';
import { Smile } from 'lucide-react';

interface SimpleCommentEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const EMOJI_CATEGORIES = {
  'Mặt cười': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨'
  ],
  'Cảm xúc': [
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '🥱', '😷', '🤒',
    '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
    '🤯', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲',
    '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢',
    '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫',
    '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️'
  ],
  'Tay & cơ thể': [
    '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️',
    '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆',
    '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
    '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
    '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '💋', '🩸'
  ],
  'Trái tim': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '❤️‍🔥', '❤️‍🩹', '💌'
  ],
  'Động vật': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
    '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
    '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞',
    '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️'
  ],
  'Thực phẩm': [
    '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
    '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
    '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑',
    '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐',
    '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈',
    '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭',
    '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯',
    '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲',
    '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚',
    '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨',
    '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬',
    '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'
  ],
  'Hoạt động': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
    '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
    '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
    '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺',
    '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣',
    '🧗', '🚴', '🚵', '🎪', '🎭', '🎨', '🎬', '🎤',
    '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗',
    '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮'
  ],
  'Thiên nhiên': [
    '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼',
    '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾',
    '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺',
    '🌍', '🌎', '🌏', '🌐', '🌑', '🌒', '🌓', '🌔',
    '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜',
    '☀️', '🌝', '🌞', '⭐', '🌟', '✨', '⚡', '☄️',
    '💫', '🔥', '🌈', '☁️', '⛅', '⛈️', '🌤️', '🌥️',
    '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '💨'
  ],
  'Biểu tượng': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
    '💝', '✨', '⭐', '🌟', '💫', '🔥', '💯', '✅',
    '❌', '⭕', '🚫', '💢', '💥', '💦', '💨', '🕳️',
    '💬', '💭', '🗯️', '💤', '🎉', '🎊', '🎈', '🎁',
    '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '⚠️', '🔱'
  ]
};

const SimpleCommentEditor: React.FC<SimpleCommentEditorProps> = ({
  content,
  onChange,
  placeholder = 'Viết bình luận...'
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Flatten all emojis from categories
  const allEmojis = Object.values(EMOJI_CATEGORIES).flat();

  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      onChange(newContent);

      // Move cursor after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 min-h-[100px] resize-none focus:outline-none text-gray-700"
        />

        {/* Toolbar */}
        <div className="bg-gray-50 border-t border-gray-300 p-2 flex justify-start">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Thêm emoji"
          >
            <Smile size={20} />
          </button>
        </div>
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-[350px] z-50">
          {/* Emoji grid - all emojis */}
          <div className="p-3 max-h-[320px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-8 gap-1">
              {allEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-lg transition-all hover:scale-125 cursor-pointer"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default SimpleCommentEditor;
