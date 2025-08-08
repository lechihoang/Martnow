import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteCountProps {
  productId: number;
  className?: string;
}

const FavoriteCount: React.FC<FavoriteCountProps> = ({ productId, className = '' }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteCount();
  }, [productId]);

  const fetchFavoriteCount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/favorites/count/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching favorite count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}>
        <Heart size={16} />
        <span>...</span>
      </div>
    );
  }

  if (count === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      <Heart size={16} className="text-red-500" />
      <span>{count} lượt yêu thích</span>
    </div>
  );
};

export default FavoriteCount;
