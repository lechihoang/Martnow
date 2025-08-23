import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { SettingsTab } from '@/constants/settingsTabs';

interface SettingsLayoutProps {
  user: { id: number; name?: string } | null;
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  user,
  tabs,
  activeTab,
  onTabChange,
  children
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Quay lại
            </button>
          </div>
          
          {/* Title and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
            </div>
            
            {user && (
              <button
                onClick={() => router.push(`/profile/${user.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                👁️ Xem hồ sơ công khai
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
