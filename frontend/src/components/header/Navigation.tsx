'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/shop', label: 'Cửa hàng' },
    { href: '/blog', label: 'Tin tức' },
    { href: '/introduction', label: 'Giới thiệu' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`relative text-gray-700 hover:text-emerald-600 transition-colors font-medium group ${
            isActive(link.href) ? 'text-emerald-600' : ''
          }`}
        >
          {link.label}
          {/* Underline effect */}
          <span
            className={`absolute left-0 right-0 bottom-0 h-0.5 bg-emerald-600 transform transition-transform duration-300 origin-center ${
              isActive(link.href)
                ? 'scale-x-100'
                : 'scale-x-0 group-hover:scale-x-100'
            }`}
            style={{ top: '100%', marginTop: '4px' }}
          />
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
