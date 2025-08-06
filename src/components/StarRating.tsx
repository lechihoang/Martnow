import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md'
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (star: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (!readonly) {
      setHoveredRating(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const getStarColor = (star: number) => {
    const currentRating = hoveredRating || rating;
    if (star <= currentRating) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${sizeClasses[size]} ${getStarColor(star)} ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-all duration-150`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
