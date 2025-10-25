"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Upload, User as UserIcon, Mail, AtSign, Phone, MapPin } from 'lucide-react';
import AvatarUploadModal from '@/components/AvatarUploadModal';
import { User } from '@/types/entities';

interface UserInfoProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
  readOnly?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, onUpdate, readOnly = false }) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Check if any editable field has changed
    const changed =
      (field === 'name' && value !== user.name) ||
      (field === 'phone' && value !== (user.phone || '')) ||
      (field === 'address' && value !== (user.address || ''));
    setHasChanges(changed || formData.name !== user.name || formData.phone !== (user.phone || '') || formData.address !== (user.address || ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasChanges) {
      try {
        await onUpdate({
          name: formData.name,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        });
        toast.success('Cập nhật thông tin thành công!');
        setHasChanges(false);
      } catch (error) {
        console.error('❌ Error updating profile:', error);
        toast.error('Có lỗi xảy ra khi cập nhật thông tin');
      }
    }
  };

  const handleAvatarUploadSuccess = async (avatarUrl: string) => {
    try {
      await onUpdate({ avatar: avatarUrl });
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      toast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện');
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user.avatar}
        onUploadSuccess={handleAvatarUploadSuccess}
      />

      {/* Avatar Section */}
      <div className="flex flex-col items-center pb-8 border-b border-gray-200">
        <div className="relative">
          <Image
            key={user.avatar || 'default'}
            src={user.avatar || '/default-avatar.jpg'}
            alt={user.name}
            width={120}
            height={120}
            className="w-30 h-30 rounded-full object-cover border-4 border-gray-100 shadow-lg"
            unoptimized
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mt-4">{user.name}</h3>
        <p className="text-gray-500">@{user.username}</p>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Đổi ảnh đại diện
          </button>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              Họ và tên
            </div>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={readOnly}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <AtSign className="w-4 h-4 text-gray-500" />
              Tên đăng nhập
              <span className="ml-auto text-xs text-gray-500">(Không thể thay đổi)</span>
            </div>
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              Email
              <span className="ml-auto text-xs text-gray-500">(Không thể thay đổi)</span>
            </div>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              Số điện thoại
            </div>
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={readOnly}
            placeholder="Nhập số điện thoại"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              Địa chỉ
            </div>
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={readOnly}
            placeholder="Nhập địa chỉ"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-none"
          />
        </div>

        {!readOnly && (
          <div className="pt-4">
            <button
              type="submit"
              disabled={!hasChanges}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {hasChanges ? 'Lưu thay đổi' : 'Không có thay đổi'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserInfo;
