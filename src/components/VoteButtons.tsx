'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { blogApi } from '../lib/api';
import useUser from '../hooks/useUser';

interface VoteButtonsProps {
  blogId: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: 'up' | 'down' | null;
  orientation?: 'horizontal' | 'vertical';
  onVoteChange?: (newStats: { upvoteCount: number; downvoteCount: number; userVote: 'up' | 'down' | null }) => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  blogId,
  upvoteCount,
  downvoteCount,
  userVote,
  orientation = 'horizontal',
  onVoteChange,
}) => {
  const [localUpvotes, setLocalUpvotes] = useState(upvoteCount);
  const [localDownvotes, setLocalDownvotes] = useState(downvoteCount);
  const [localUserVote, setLocalUserVote] = useState(userVote);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
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
    ? 'flex flex-col items-center space-y-1'
    : 'flex items-center space-x-4';

  const buttonClass = 'flex items-center space-x-1 px-2 py-1 rounded transition-colors disabled:opacity-50';

  return (
    <div className={containerClass}>
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        disabled={loading}
        className={`${buttonClass} ${
          localUserVote === 'up'
            ? 'bg-green-100 text-green-600'
            : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
        }`}
        title="Upvote"
      >
        <ChevronUp size={18} className={localUserVote === 'up' ? 'fill-current' : ''} />
        <span className="text-sm font-medium">{localUpvotes}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        disabled={loading}
        className={`${buttonClass} ${
          localUserVote === 'down'
            ? 'bg-red-100 text-red-600'
            : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
        }`}
        title="Downvote"
      >
        <ChevronDown size={18} className={localUserVote === 'down' ? 'fill-current' : ''} />
        <span className="text-sm font-medium">{localDownvotes}</span>
      </button>

      {loading && (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      )}
    </div>
  );
};

export default VoteButtons;
