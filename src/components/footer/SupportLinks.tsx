import React from 'react';
import Link from 'next/link';

const SupportLinks = () => {
  const supportLinks = [
    { href: '/help', label: 'Trung tâm trợ giúp' },
    { href: '/contact', label: 'Liên hệ chúng tôi' },
    { href: '/faq', label: 'Câu hỏi thường gặp' },
    { href: '/shipping', label: 'Chính sách giao hàng' },
    { href: '/returns', label: 'Chính sách đổi trả' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Hỗ trợ</h3>
      <ul className="space-y-2">
        {supportLinks.map((link) => (
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

export default SupportLinks;
