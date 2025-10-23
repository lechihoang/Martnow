"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
      console.log('🔍 Fetching seller products...');

      // Gọi API để lấy sản phẩm của seller
      const sellerProducts = await productApi.getSellerProducts();
      console.log('📦 Seller products:', sellerProducts);

      setProducts(sellerProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);

      // Kiểm tra nếu là lỗi 404 - không tìm thấy seller
      if (error && typeof error === 'object' && 'status' in error) {
        const errorWithStatus = error as { status: number };
        if (errorWithStatus.status === 404) {
          console.log('🚨 Seller not found - user may not be registered as seller');
        }
      }

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async (productId: number, newPrice: number) => {
    try {
      // Gọi API để cập nhật giá
      await productApi.updateProduct(productId, { price: newPrice });

      // Cập nhật state local sau khi API thành công
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, price: newPrice }
            : product
        )
      );
      setEditingProduct(null);
    } catch (error) {
      console.error('❌ Error updating price:', error);
      alert('Có lỗi xảy ra khi cập nhật giá. Vui lòng thử lại.');
    }
  };

  const toggleStock = async (productId: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Gọi API để cập nhật trạng thái
      await productApi.updateProduct(productId, { isAvailable: !product.isAvailable });

      // Cập nhật state local sau khi API thành công
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, isAvailable: !product.isAvailable }
            : product
        )
      );
    } catch (error) {
      console.error('❌ Error toggling stock:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const updateStock = async (productId: number, newStock: number) => {
    try {
      // Gọi API để cập nhật số lượng
      await productApi.updateProduct(productId, {
        stock: newStock,
        isAvailable: newStock > 0
      });

      // Cập nhật state local sau khi API thành công
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, stock: newStock, isAvailable: newStock > 0 }
            : product
        )
      );
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      alert('Có lỗi xảy ra khi cập nhật số lượng. Vui lòng thử lại.');
    }
  };

  const handleDiscountUpdate = async (productId: number, newDiscount: number) => {
    try {
      // Gọi API để cập nhật giảm giá
      await productApi.updateProduct(productId, { discount: newDiscount });

      // Cập nhật state local sau khi API thành công
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, discount: newDiscount }
            : product
        )
      );
      setEditingDiscount(null);
    } catch (error) {
      console.error('❌ Error updating discount:', error);
      alert('Có lỗi xảy ra khi cập nhật giảm giá. Vui lòng thử lại.');
    }
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
          onClick={() => router.push('/product/add')}
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

      {/* Products List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Danh sách sản phẩm</h3>
          <button
            onClick={() => router.push('/product/add')}
            className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            ➕ Thêm sản phẩm
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá gốc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảm giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá bán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  {/* Product Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <Image
                          src={product.imageUrl || '/placeholder-product.jpg'}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingProduct === product.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          defaultValue={product.price}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.price.toLocaleString('vi-VN')}đ
                        </div>
                        <button
                          onClick={() => setEditingProduct(product.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Sửa giá
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingDiscount === product.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          defaultValue={product.discount || 0}
                          min="0"
                          max="100"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="0-100"
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.discount || 0}%
                        </div>
                        <button
                          onClick={() => setEditingDiscount(product.id)}
                          className="text-xs text-orange-600 hover:text-orange-800"
                        >
                          Sửa giảm giá
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Final Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      {product.discount && product.discount > 0 ? (
                        <>
                          {(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')}đ
                          <div className="text-xs text-gray-500 mt-1">
                            Tiết kiệm {product.discount}%
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-900">{product.price.toLocaleString('vi-VN')}đ</span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStock(product.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {product.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/product/edit/${product.id}`)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProduct === product.id}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          deletingProduct === product.id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {deletingProduct === product.id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
