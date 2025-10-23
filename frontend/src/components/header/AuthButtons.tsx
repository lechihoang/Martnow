import React from 'react';
import Link from 'next/link';

const AuthButtons = () => {
  return (
    <>
      <Link
        href="/auth/login"
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
      >
        Đăng nhập
      </Link>
      <Link
        href="/auth/register"
        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
      >
        Đăng ký
      </Link>
    </>
  );
};

export default AuthButtons;
