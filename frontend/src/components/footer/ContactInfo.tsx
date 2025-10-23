import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactInfo = () => {
  const contactData = [
    {
      icon: MapPin,
      type: 'address',
      content: (
        <div>
          <p className="text-gray-600 text-sm">
            123 Đường ABC, Quận 1<br />
            TP. Hồ Chí Minh, Việt Nam
          </p>
        </div>
      ),
    },
    {
      icon: Phone,
      type: 'phone',
      content: (
        <Link 
          href="tel:+84123456789" 
          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
        >
          +84 123 456 789
        </Link>
      ),
    },
    {
      icon: Mail,
      type: 'email',
      content: (
        <Link 
          href="mailto:support@martnow.vn" 
          className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
        >
          support@martnow.vn
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Liên hệ</h3>
      <div className="space-y-3">
        {contactData.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <item.icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfo;
