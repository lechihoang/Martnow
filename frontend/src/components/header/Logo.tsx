import React from 'react';
import Link from 'next/link';

const Logo = () => {
  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold">
          <span className="text-emerald-600">M</span>
          <span className="text-gray-900">artNow</span>
        </span>
      </Link>
    </div>
  );
};

export default Logo;
