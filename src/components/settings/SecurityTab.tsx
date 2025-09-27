import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import ChangePasswordForm from '../ChangePasswordForm';

const SecurityTab: React.FC = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  const securityOptions = [
    {
      title: 'Đổi mật khẩu',
      description: 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn',
      buttonText: 'Đổi mật khẩu',
      buttonClass: 'bg-red-600 hover:bg-red-700',
      action: () => setShowChangePassword(true)
    },
    {
      title: 'Xác thực 2 yếu tố (2FA)',
      description: 'Tăng cường bảo mật với xác thực 2 yếu tố',
      buttonText: 'Bật 2FA',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        // TODO: Implement 2FA functionality
        console.log('Enable 2FA clicked');
      }
    }
  ];

  if (showChangePassword) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h2>
        </div>

        <ChangePasswordForm
          onSuccess={() => {
            setShowChangePassword(false);
          }}
          onCancel={() => setShowChangePassword(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Bảo mật tài khoản</h2>
      </div>

      <div className="space-y-6">
        {securityOptions.map((option, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {option.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {option.description}
            </p>
            <button
              onClick={option.action}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${option.buttonClass}`}
            >
              {option.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityTab;
