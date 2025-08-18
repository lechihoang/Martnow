"use client";

import React from 'react';
import Image from 'next/image';
import { User, UserRole } from '@/types/entities';
import { Clock, ShoppingBag, Star, MessageCircle, Heart } from 'lucide-react';

interface Activity {
  id: string;
  type: 'order' | 'review' | 'like' | 'comment';
  title: string;
  description: string;
  timestamp: Date;
  imageUrl?: string;
  metadata?: any;
}

interface RecentActivityProps {
  user: User;
  isOwnProfile: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  user,
  isOwnProfile
}) => {
  // Mock data - trong thực tế sẽ fetch từ API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'order',
      title: 'Đã đặt hàng',
      description: 'Bánh mì thịt nướng từ Quán Cô Ba',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      imageUrl: '/images/products/banh-mi.jpg'
    },
    {
      id: '2',
      type: 'review',
      title: 'Đã đánh giá',
      description: 'Trà sữa trân châu đường đen - 5⭐',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      imageUrl: '/images/products/tra-sua.jpg'
    },
    {
      id: '3',
      type: 'like',
      title: 'Đã thích',
      description: 'Cơm tấm sườn nướng đặc biệt',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      imageUrl: '/images/products/com-tam.jpg'
    },
    {
      id: '4',
      type: 'order',
      title: 'Đã hoàn thành đơn hàng',
      description: 'Phở bò tái + nước cam tươi',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      imageUrl: '/images/products/pho.jpg'
    }
  ];

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 border-blue-200';
      case 'review':
        return 'bg-yellow-50 border-yellow-200';
      case 'like':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          {isOwnProfile ? 'Hoạt động gần đây' : `Hoạt động của ${user.name}`}
        </h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`p-4 rounded-lg border-2 ${getActivityColor(activity.type)} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-4">
              {/* Activity Icon */}
              <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm">
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>

                  {/* Activity Image */}
                  {activity.imageUrl && (
                    <div className="flex-shrink-0 ml-4">
                      <Image
                        src={activity.imageUrl}
                        alt={activity.description}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="text-center mt-6">
        <button className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
          Xem thêm hoạt động →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
