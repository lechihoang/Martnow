import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

const FooterBottom = () => {
  const currentYear = new Date().getFullYear();
  
  const legalLinks = [
    { href: '/privacy', label: 'Chính sách bảo mật' },
    { href: '/terms', label: 'Điều khoản sử dụng' },
    { href: '/cookies', label: 'Chính sách cookie' },
  ];

  return (
    <div className="border-t border-gray-200 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>© {currentYear} MartNow. Được tạo với</span>
          <Heart className="w-4 h-4 text-red-500" />
          <span>tại Việt Nam</span>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          {legalLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FooterBottom;
