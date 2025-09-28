"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import ProfileCard from './ProfileCard';
import { User } from '@/types/entities';

interface UserInfoProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
  readOnly?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 5MB');
      return;
    }

    console.log('🔄 Starting avatar upload for user:', user.id);
    setUploadingAvatar(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('files', file);
      formData.append('entityType', 'user');
      formData.append('entityId', user.id.toString());

      console.log('📤 Uploading to media endpoint...');

      // Upload to backend media endpoint
      const response = await fetch('http://localhost:3001/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      console.log('📥 Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const uploadResponse = await response.json();
      console.log('✅ Upload response:', uploadResponse);
      
      // Backend trả về { status, message, data }
      if (uploadResponse.status === 'success' && uploadResponse.data && uploadResponse.data.length > 0) {
        // Update user avatar with the new URL
        const avatarUrl = uploadResponse.data[0].secureUrl;
        console.log('🖼️ New avatar URL:', avatarUrl);
        
        // Update local state immediately for better UX
        onUpdate({ avatar: avatarUrl });
        console.log('✅ Local state updated successfully');
        
        toast.success('Cập nhật ảnh đại diện thành công!');
      } else {
        console.error('❌ Invalid upload response:', uploadResponse);
        throw new Error('Upload response không hợp lệ');
      }
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      if (error instanceof Error) {
        toast.error(`Lỗi: ${error.message}`);
      } else {
        toast.error('Có lỗi xảy ra khi tải ảnh lên');
      }
    } finally {
      setUploadingAvatar(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <ProfileCard title="Thông tin cá nhân">
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      
      <div className="flex items-center mb-6">
        <div className="relative group">
          <Image
            src={user.avatar || '/default-avatar.jpg'}
            alt={user.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          {!readOnly && (
            <>
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                   onClick={triggerAvatarUpload}>
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              {/* Upload button for mobile */}
              <button
                type="button"
                onClick={triggerAvatarUpload}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:bg-gray-400"
              >
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
          <p className="text-gray-500">@{user.username}</p>
          {!readOnly && (
            <p className="text-xs text-gray-400 mt-1">Hover để thay đổi ảnh đại diện</p>
          )}
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
