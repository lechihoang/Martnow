"use client";
import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import { User } from '@/types/entities';

interface UserInfoProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
  readOnly?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
    });
    setIsEditing(false);
  };

  return (
    <ProfileCard title="Thông tin cá nhân">
      <div className="flex items-center mb-6">
        <img
          src={user.avatar || '/default-avatar.jpg'}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
        />
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-gray-500">@{user.username}</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </button>
        )}
      </div>

      {isEditing && !readOnly ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Họ và tên:</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tên đăng nhập:</span>
            <span className="font-medium">@{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
        </div>
      )}
    </ProfileCard>
  );
};

export default UserInfo;
