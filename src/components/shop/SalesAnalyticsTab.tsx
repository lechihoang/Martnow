"use client";

import React, { useState, useEffect } from 'react';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

const SalesAnalyticsTab: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateMockData();
  }, [timeRange]);

  const generateMockData = () => {
    setLoading(true);
    
    // Generate mock data based on time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: SalesData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const revenue = Math.floor(Math.random() * 2000000) + 500000; // 500k - 2.5M VND
      const orders = Math.floor(Math.random() * 20) + 5; // 5-25 orders
      
      data.push({
        date: date.toLocaleDateString('vi-VN'),
        revenue,
        orders
      });
    }
    
    setSalesData(data);
    setTimeout(() => setLoading(false), 500); // Simulate loading
  };

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const maxRevenue = Math.max(...salesData.map(d => d.revenue));

  return (
    <div>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Biểu đồ doanh số</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: '7d' as const, label: '7 ngày' },
            { key: '30d' as const, label: '30 ngày' },
            { key: '3m' as const, label: '3 tháng' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setTimeRange(option.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === option.key
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-green-600 text-3xl mr-4">💰</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-green-700">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-green-600 mt-1">
                {timeRange === '7d' ? '7 ngày qua' : timeRange === '30d' ? '30 ngày qua' : '3 tháng qua'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-blue-600 text-3xl mr-4">📦</div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
              <p className="text-xs text-blue-600 mt-1">
                Trung bình {Math.round(totalOrders / salesData.length)} đơn/ngày
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-purple-600 text-3xl mr-4">🎯</div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Giá trị TB/đơn</p>
              <p className="text-2xl font-bold text-purple-700">
                {Math.round(avgOrderValue).toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Mỗi đơn hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
        <div className="space-y-2" style={{ minHeight: '300px' }}>
          {salesData.map((day, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-xs text-gray-600 flex-shrink-0">
                {day.date}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full transition-all duration-300"
                    style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {day.revenue.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-16 text-xs text-gray-600 text-right flex-shrink-0">
                {day.orders} đơn
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Số đơn hàng theo ngày</h3>
        <div className="flex items-end justify-between h-64 space-x-1">
          {salesData.map((day, index) => {
            const maxOrders = Math.max(...salesData.map(d => d.orders));
            const height = (day.orders / maxOrders) * 100;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t relative group-hover:bg-blue-700 cursor-pointer"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${day.date}: ${day.orders} đơn hàng`}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                      {day.orders}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                  {day.date.split('/').slice(0, 2).join('/')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsTab;
