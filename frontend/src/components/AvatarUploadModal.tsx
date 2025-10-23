"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Upload, Trash2 } from 'lucide-react';
import { uploadApi } from '@/lib/api';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onUploadSuccess: (avatarUrl: string) => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onUploadSuccess,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      console.log('📤 Uploading avatar...');
      const response = await uploadApi.uploadFile(selectedFile, 'avatar');

      if (response.data && response.data.length > 0) {
        const avatarUrl = response.data[0].secureUrl;
        console.log('✅ Avatar uploaded:', avatarUrl);
        onUploadSuccess(avatarUrl);
        handleClose();
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh lên';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatar = previewUrl || currentAvatar || '/default-avatar.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - transparent to keep original background visible */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Cập nhật ảnh đại diện
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Preview Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100">
                <Image
                  src={displayAvatar}
                  alt=""
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </div>
              {previewUrl && (
                <>
                  {/* Checkmark icon */}
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={handleRemovePreview}
                    className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Upload Area */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload-input"
            />

            {!previewUrl ? (
              <label
                htmlFor="avatar-upload-input"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Nhấp để chọn ảnh
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF (tối đa 5MB)
                </p>
              </label>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium text-green-600">✓</span> Đã chọn ảnh mới
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Chọn ảnh khác
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang tải...
                </>
              ) : (
                'Cập nhật'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;
