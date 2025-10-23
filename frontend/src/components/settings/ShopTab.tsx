import React from 'react';
import { Store } from 'lucide-react';
import SellerInfo from '@/components/profile/SellerInfo';
import { Seller } from '@/types/entities';

interface ShopTabProps {
  seller: Seller | null;
  onUpdate: (updatedSeller: Partial<Seller>) => Promise<void>;
  onCreate: (sellerData: Partial<Seller>) => Promise<void>;
}

const ShopTab: React.FC<ShopTabProps> = ({ seller, onUpdate, onCreate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Store className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Thông tin cửa hàng</h2>
      </div>
      
      {seller ? (
        <SellerInfo 
          seller={seller} 
          onUpdate={onUpdate}
          readOnly={false}
        />
      ) : (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Bạn chưa có cửa hàng
          </h3>
          <p className="text-gray-500 mb-6">
            Tạo cửa hàng để bắt đầu bán sản phẩm của bạn
          </p>
          <button
            onClick={() => onCreate({})}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            🏢 Tạo cửa hàng
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopTab;
