"use client";

import React from 'react';
import { User, UserRole } from '@/types/entities';
import { Calendar, MapPin, Phone, Mail, Star, Users, Award } from 'lucide-react';

interface PublicProfileCardProps {
  user: User;
  isOwnProfile: boolean;
  onMessage?: () => void;
  onViewShop?: () => void;
}

const PublicProfileCard: React.FC<PublicProfileCardProps> = ({
  user,
  isOwnProfile,
  onMessage,
  onViewShop
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Profile Avatar */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <img
              src={user.avatar || '/images/default-avatar.png'}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            {/* Online Status */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="pt-20 pb-8 px-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.role === UserRole.SELLER 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === UserRole.SELLER ? '🏪 Người bán' : '🛒 Người mua'}
              </span>
            </div>
            <p className="text-xl text-gray-600 mb-4">@{user.username}</p>
            
            {/* User Stats */}
            <div className="flex gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">147</div>
                <div className="text-sm text-gray-500">Đơn hàng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  Đánh giá
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">2.5k</div>
                <div className="text-sm text-gray-500">Theo dõi</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <button 
                onClick={() => window.location.href = '/settings'}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                ✏️ Chỉnh sửa hồ sơ
              </button>
            ) : (
              <>
                <button 
                  onClick={onMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  💬 Nhắn tin
                </button>
                {user.role === UserRole.SELLER && (
                  <button 
                    onClick={onViewShop}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    🏪 Xem cửa hàng
                  </button>
                )}
                <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  ➕ Theo dõi
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail className="w-5 h-5" />
            <span>{user.email}</span>
          </div>
          {/* Phone field not available in User entity */}
          {/* Address field not available in User entity */}
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>Thành viên Foodee</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <Award className="w-4 h-4" />
            Thành viên VIP
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ Đã xác thực
          </span>
          {user.role === UserRole.SELLER && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            🏆 Người bán tin cậy
            </span>
          )}
        </div>

        {/* Bio/Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Giới thiệu</h3>
          <p className="text-gray-600">
            {user.role === UserRole.SELLER 
              ? "Chào mừng đến với cửa hàng của tôi! Tôi chuyên bán các sản phẩm chất lượng cao với giá tốt nhất. Hãy liên hệ nếu bạn có bất kỳ câu hỏi nào!"
              : "Người mua tích cực trên Foodee. Thích khám phá các món ăn mới và ủng hộ các cửa hàng địa phương."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileCard;
