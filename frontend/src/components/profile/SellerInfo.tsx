"use client";
import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import { Seller } from '@/types/entities';

interface SellerInfoProps {
  seller: Seller;
  onUpdate: (updatedSeller: Partial<Seller>) => void;
  readOnly?: boolean;
}

const SellerInfo: React.FC<SellerInfoProps> = ({ seller, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shopName: seller.shopName || '',
    description: seller.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      shopName: seller.shopName || '',
      description: seller.description || '',
    });
    setIsEditing(false);
  };

  return (
    <ProfileCard title="Thông tin cửa hàng">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {seller.shopName || 'Chưa có tên cửa hàng'}
        </h3>
        {!readOnly && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </button>
        )}
      </div>

      {isEditing && !readOnly ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên cửa hàng
            </label>
            <input
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên cửa hàng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả cửa hàng
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả về cửa hàng của bạn"
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Địa chỉ và số điện thoại được quản lý trong phần "Thông tin cá nhân".
            </p>
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
            <span className="text-gray-600">Tên cửa hàng:</span>
            <span className="font-medium">{seller.shopName || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Địa chỉ:</span>
            <span className="font-medium">{seller.user?.address || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số điện thoại:</span>
            <span className="font-medium">{seller.user?.phone || 'Chưa cập nhật'}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-2">Mô tả:</span>
            <p className="text-gray-800 bg-gray-50 p-3 rounded">
              {seller.description || 'Chưa có mô tả'}
            </p>
          </div>
        </div>
      )}
    </ProfileCard>
  );
};

export default SellerInfo;
