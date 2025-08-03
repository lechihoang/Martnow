"use client";
import React from 'react';
import ProfileCard from './ProfileCard';
import { Stats } from '@/types/entities';

interface SellerStatsProps {
  stats: Stats;
}

const SellerStats: React.FC<SellerStatsProps> = ({ stats }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const statItems = [
    {
      label: 'Tổng đơn hàng',
      value: stats.totalOrders,
      icon: '📦',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Doanh thu',
      value: formatPrice(stats.totalRevenue),
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Sản phẩm',
      value: stats.totalProducts,
      icon: '🛍️',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Đơn chờ xử lý',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <ProfileCard title="Thống kê bán hàng">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className={`${item.bgColor} rounded-lg p-4 text-center`}>
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className={`text-2xl font-bold ${item.color} mb-1`}>
              {item.value}
            </div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
    </ProfileCard>
  );
};

export default SellerStats;
