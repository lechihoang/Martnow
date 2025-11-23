'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get Supabase session to get access token
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Phiên đăng nhập đã hết hạn');
        router.push('/auth/login');
        return;
      }

      // Update role via backend API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/update-role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role: selectedRole.toUpperCase(), // Convert to BUYER/SELLER
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật vai trò thất bại');
      }

      console.log('✅ Role updated successfully');
      toast.success('Đã chọn vai trò thành công!');

      // Redirect to home page
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      console.error('❌ Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng bạn đến với Foodee!
          </h2>
          <p className="text-gray-600">
            Vui lòng chọn vai trò của bạn để tiếp tục
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-6">
            <div>
              <label className="text-gray-700 font-medium block mb-4">
                Bạn muốn sử dụng Foodee với tư cách
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer Option */}
                <label
                  className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                    selectedRole === 'buyer'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 ring-opacity-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value="buyer"
                    checked={selectedRole === 'buyer'}
                    onChange={(e) => setSelectedRole(e.target.value as 'buyer')}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center gap-3">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        selectedRole === 'buyer'
                          ? 'bg-emerald-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <ShoppingBag
                        className={`w-8 h-8 ${
                          selectedRole === 'buyer'
                            ? 'text-emerald-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div
                        className={`font-semibold text-lg ${
                          selectedRole === 'buyer'
                            ? 'text-emerald-900'
                            : 'text-gray-700'
                        }`}
                      >
                        Người mua
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Mua sắm và đặt hàng từ các cửa hàng
                      </div>
                    </div>
                  </div>
                  {selectedRole === 'buyer' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </label>

                {/* Seller Option */}
                <label
                  className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                    selectedRole === 'seller'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600 ring-opacity-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    value="seller"
                    checked={selectedRole === 'seller'}
                    onChange={(e) => setSelectedRole(e.target.value as 'seller')}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center gap-3">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        selectedRole === 'seller'
                          ? 'bg-emerald-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Store
                        className={`w-8 h-8 ${
                          selectedRole === 'seller'
                            ? 'text-emerald-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div
                        className={`font-semibold text-lg ${
                          selectedRole === 'seller'
                            ? 'text-emerald-900'
                            : 'text-gray-700'
                        }`}
                      >
                        Người bán
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Bán sản phẩm và quản lý cửa hàng
                      </div>
                    </div>
                  </div>
                  {selectedRole === 'seller' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </div>
              ) : (
                'Tiếp tục'
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Bạn có thể thay đổi vai trò sau trong phần cài đặt tài khoản
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
