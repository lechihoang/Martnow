"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductResponseDto } from '@/types/dtos';
import { productApi } from '@/lib/api';

const ProductsTab: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<number | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Gọi API để lấy sản phẩm của seller
      const sellerProducts = await productApi.getSellerProducts();
      setProducts(sellerProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = (productId: number, newPrice: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, price: newPrice }
          : product
      )
    );
    setEditingProduct(null);
  };

  const toggleStock = (productId: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, isAvailable: !product.isAvailable }
          : product
      )
    );
  };

  const updateStock = (productId: number, newStock: number) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, stock: newStock, isAvailable: newStock > 0 }
          : product
      )
    );
  };

  const handleDiscountUpdate = (productId: number, newDiscount: number) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, discount: newDiscount }
          : product
      )
    );
    setEditingDiscount(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeletingProduct(productId);
      // Call API to delete product
      await productApi.deleteProduct(productId);
      // Remove from local state
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.');
    } finally {
      setDeletingProduct(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Đang tải sản phẩm...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có sản phẩm nào
        </h3>
        <p className="text-gray-600 mb-4">
          Hãy thêm sản phẩm đầu tiên để bắt đầu bán hàng
        </p>
        <button
          onClick={() => router.push('/add')}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          ➕ Thêm sản phẩm đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-2xl mr-3">📦</div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng sản phẩm</p>
              <p className="text-xl font-bold text-blue-700">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Còn hàng</p>
              <p className="text-xl font-bold text-green-700">
                {products.filter(p => p.isAvailable).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-2xl mr-3">❌</div>
            <div>
              <p className="text-sm text-red-600 font-medium">Hết hàng</p>
              <p className="text-xl font-bold text-red-700">
                {products.filter(p => !p.isAvailable).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-purple-600 text-2xl mr-3">💰</div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Giá trị kho</p>
              <p className="text-xl font-bold text-purple-700">
                {products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-100">
              <img
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {!product.isAvailable && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">HẾT HÀNG</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              {/* Price Management */}
              <div className="mb-3">
                {editingProduct === product.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue={product.price}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newPrice = parseFloat((e.target as HTMLInputElement).value);
                          if (newPrice > 0) {
                            handlePriceUpdate(product.id, newPrice);
                          }
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      {product.discount && product.discount > 0 && (
                        <div className="text-xs text-red-600 font-medium">
                          Giảm {product.discount}%
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingProduct(product.id)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Sửa giá
                    </button>
                  </div>
                )}
              </div>

              {/* Discount Management */}
              <div className="mb-3">
                {editingDiscount === product.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue={product.discount || 0}
                      min="0"
                      max="100"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="% giảm giá (0-100)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newDiscount = parseFloat((e.target as HTMLInputElement).value);
                          if (newDiscount >= 0 && newDiscount <= 100) {
                            handleDiscountUpdate(product.id, newDiscount);
                          }
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingDiscount(null)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Giảm giá: {product.discount || 0}%
                    </span>
                    <button
                      onClick={() => setEditingDiscount(product.id)}
                      className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                    >
                      Sửa giảm giá
                    </button>
                  </div>
                )}
              </div>

              {/* Stock Management */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tồn kho:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStock(product.id, Math.max(0, (product.stock || 0) - 1))}
                      className="w-6 h-6 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium min-w-[2rem] text-center">
                      {product.stock || 0}
                    </span>
                    <button
                      onClick={() => updateStock(product.id, (product.stock || 0) + 1)}
                      className="w-6 h-6 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stock Status Toggle */}
                <button
                  onClick={() => toggleStock(product.id)}
                  className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                    product.isAvailable
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {product.isAvailable ? '✅ Còn hàng' : '❌ Hết hàng'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => router.push(`/product/edit/${product.id}`)}
                  className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="flex-1 py-2 px-3 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  👁️ Xem
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={deletingProduct === product.id}
                  className={`flex-1 py-2 px-3 text-sm rounded transition-colors ${
                    deletingProduct === product.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {deletingProduct === product.id ? '⏳ Xóa...' : '🗑️ Xóa'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;
