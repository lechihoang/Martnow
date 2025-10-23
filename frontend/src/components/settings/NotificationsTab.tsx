import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsTab: React.FC = () => {
  const notificationSettings = [
    { 
      label: 'Đơn hàng mới', 
      description: 'Nhận thông báo khi có đơn hàng mới',
      defaultChecked: true
    },
    { 
      label: 'Tin nhắn', 
      description: 'Nhận thông báo tin nhắn mới',
      defaultChecked: true
    },
    { 
      label: 'Đánh giá', 
      description: 'Thông báo khi có đánh giá mới',
      defaultChecked: true
    },
    { 
      label: 'Khuyến mãi', 
      description: 'Nhận thông báo về khuyến mãi, giảm giá',
      defaultChecked: false
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt thông báo</h2>
      </div>
      
      <div className="space-y-4">
        {notificationSettings.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{item.label}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                defaultChecked={item.defaultChecked}
                onChange={(e) => {
                  // TODO: Handle notification setting change
                  console.log(`${item.label} notification:`, e.target.checked);
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsTab;
