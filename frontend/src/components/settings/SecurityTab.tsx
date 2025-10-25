'use client';

import React from 'react';
import { Lock, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SecurityTab: React.FC = () => {
  const router = useRouter();

  const securityOptions = [
    {
      title: 'Đổi mật khẩu',
      description: 'Cập nhật mật khẩu để bảo vệ tài khoản của bạn',
      buttonText: 'Đổi mật khẩu',
      icon: KeyRound,
      buttonClass: 'bg-red-600 hover:bg-red-700',
      action: () => router.push('/auth/change-password')
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">Bảo mật tài khoản</h2>
      </div>

      <div className="space-y-6">
        {securityOptions.map((option, index) => {
          const IconComponent = option.icon;
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {option.description}
                  </p>
                  <button
                    onClick={option.action}
                    className={`px-5 py-2.5 text-white rounded-lg font-medium transition-colors ${option.buttonClass}`}
                  >
                    {option.buttonText}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityTab;
