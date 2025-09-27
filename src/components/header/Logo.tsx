import React from 'react';
import Link from 'next/link';

const Logo = () => {
  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-bold text-orange-600">
          MartNow
        </span>
      </Link>
    </div>
  );
};

export default Logo;
