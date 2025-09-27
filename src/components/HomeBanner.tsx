import React from 'react';
import Link from 'next/link';

const HomeBanner = () => {
  return (
    <div className="bg-white py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chào mừng đến với MartNow
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Khám phá hàng ngàn sản phẩm chất lượng cao với giá cả hợp lý. Giao hàng nhanh, thanh toán an toàn.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Mua sắm ngay
        </Link>
      </div>
    </div>
  );
};

export default HomeBanner;