import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const FooterLogo = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-bold gradient-text-primary">
          MartNow
        </span>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">
        Nền tảng giao đồ ăn và mua sắm trực tuyến hàng đầu Việt Nam. 
        Kết nối người bán và người mua một cách thuận tiện và an toàn.
      </p>
      <div className="flex space-x-4">
        <Link 
          href="#" 
          className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
          aria-label="Facebook"
        >
          <Facebook className="w-5 h-5" />
        </Link>
        <Link 
          href="#" 
          className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
          aria-label="Instagram"
        >
          <Instagram className="w-5 h-5" />
        </Link>
        <Link 
          href="#" 
          className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
          aria-label="Twitter"
        >
          <Twitter className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default FooterLogo;
