'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { blogApi } from '../lib/api';

interface VoteButtonsProps {
  blogId: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: 'up' | 'down' | null;
  orientation?: 'horizontal' | 'vertical';
  onVoteChange?: (newStats: { upvoteCount: number; downvoteCount: number; userVote: 'up' | 'down' | null }) => void;
  userProfile: any;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  blogId,
  upvoteCount,
  downvoteCount,
  userVote,
  orientation = 'horizontal',
  onVoteChange,
  userProfile
}) => {
  const [localUpvotes, setLocalUpvotes] = useState(upvoteCount);
  const [localDownvotes, setLocalDownvotes] = useState(downvoteCount);
  const [localUserVote, setLocalUserVote] = useState(userVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!userProfile) {
      alert('Bạn cần đăng nhập để vote');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      
      let result;
      if (localUserVote === voteType) {
        // Remove vote if clicking the same vote type
        result = await blogApi.unvoteBlog(blogId);
      } else {
        // Add or change vote
        result = await blogApi.voteBlog(blogId, voteType);
      }

      setLocalUpvotes(result.upvoteCount);
      setLocalDownvotes(result.downvoteCount);
      setLocalUserVote(result.userVote);
      
      onVoteChange?.(result);
    } catch (err) {
      console.error('Error voting:', err);
      alert('Không thể vote. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const containerClass = orientation === 'vertical' 
    ? 'flex flex-col items-center space-y-2'
    : 'flex items-center space-x-3';

  const buttonClass = 'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 hover:scale-105';

  return (
    <div className={containerClass}>
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        disabled={loading}
        className={`${buttonClass} ${
          localUserVote === 'up'
            ? 'bg-green-100 text-green-700 border-2 border-green-200 shadow-md'
            : 'text-gray-600 hover:bg-green-50 hover:text-green-600 border-2 border-gray-200 hover:border-green-200'
        }`}
        title="Upvote"
      >
        <ChevronUp size={20} className={`${localUserVote === 'up' ? 'fill-current' : ''}`} />
        <span className="text-base font-semibold">{localUpvotes}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        disabled={loading}
        className={`${buttonClass} ${
          localUserVote === 'down'
            ? 'bg-red-100 text-red-700 border-2 border-red-200 shadow-md'
            : 'text-gray-600 hover:bg-red-50 hover:text-red-600 border-2 border-gray-200 hover:border-red-200'
        }`}
        title="Downvote"
      >
        <ChevronDown size={20} className={`${localUserVote === 'down' ? 'fill-current' : ''}`} />
        <span className="text-base font-semibold">{localDownvotes}</span>
      </button>
    </div>
  );
};

export default VoteButtons;
