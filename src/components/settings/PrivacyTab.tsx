import React from 'react';
import { Eye } from 'lucide-react';

const PrivacyTab: React.FC = () => {
  const privacyItems = ['Email', 'Số điện thoại', 'Địa chỉ', 'Hoạt động gần đây'];
  
  const privacyOptions = [
    { value: 'public', label: 'Công khai' },
    { value: 'friends', label: 'Chỉ bạn bè' },
    { value: 'private', label: 'Riêng tư' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Eye className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Quyền riêng tư</h2>
      </div>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hiển thị thông tin</h3>
          <p className="text-gray-600 mb-4">Quản lý thông tin nào có thể nhìn thấy công khai</p>
          
          <div className="space-y-3">
            {privacyItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{item}</span>
                <select 
                  className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue="public"
                  onChange={(e) => {
                    // TODO: Handle privacy setting change
                    console.log(`${item} privacy:`, e.target.value);
                  }}
                >
                  {privacyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyTab;
