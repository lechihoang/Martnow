import React from 'react';
import Link from 'next/link';

const Navigation = () => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
        Trang chủ
      </Link>
      <Link href="/shop" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
        Cửa hàng
      </Link>
      <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
        Tin tức
      </Link>
      <Link href="/introduction" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
        Giới thiệu
      </Link>
    </nav>
  );
};

export default Navigation;
