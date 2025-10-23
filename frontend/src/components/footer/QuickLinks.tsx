import React from 'react';
import Link from 'next/link';

const QuickLinks = () => {
  const links = [
    { href: '/', label: 'Trang chủ' },
    { href: '/search', label: 'Tạp hóa' },
    { href: '/blog', label: 'Tin tức' },
    { href: '/orders', label: 'Đơn hàng' },
    { href: '/favorites', label: 'Yêu thích' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Liên kết nhanh</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link 
              href={link.href} 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLinks;
