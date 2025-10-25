"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ProductResponseDto } from '@/types/dtos';
import { productApi } from '@/lib/api';
import toast from 'react-hot-toast';

const ProductsTab: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProduct, setDeletingProduct] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; productId: number | null; productName: string }>({
    show: false,
    productId: null,
    productName: ''
  });

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


  const handleDeleteProduct = (productId: number, productName: string) => {
    setConfirmDelete({
      show: true,
      productId,
      productName
    });
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete.productId) return;

    const productId = confirmDelete.productId;
    setConfirmDelete({ show: false, productId: null, productName: '' });
    setDeletingProduct(productId);

    try {
      await productApi.deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      toast.success('Đã xóa sản phẩm thành công!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.');
    } finally {
      setDeletingProduct(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete({ show: false, productId: null, productName: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
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
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          ➕ Thêm sản phẩm đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 h-full">
          <div className="flex items-center h-full">
            <div className="text-blue-600 text-3xl mr-4">📦</div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-blue-700">{products.length}</p>
              <p className="text-xs text-blue-600 mt-1">Sản phẩm trong kho</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 h-full">
          <div className="flex items-center h-full">
            <div className="text-green-600 text-3xl mr-4">✅</div>
            <div>
              <p className="text-sm text-green-600 font-medium">Đang bán</p>
              <p className="text-2xl font-bold text-green-700">
                {products.filter(p => p.isAvailable).length}
              </p>
              <p className="text-xs text-green-600 mt-1">Khách có thể mua</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6 h-full">
          <div className="flex items-center h-full">
            <div className="text-red-600 text-3xl mr-4">❌</div>
            <div>
              <p className="text-sm text-red-600 font-medium">Đã tắt</p>
              <p className="text-2xl font-bold text-red-700">
                {products.filter(p => !p.isAvailable).length}
              </p>
              <p className="text-xs text-red-600 mt-1">Tạm ngừng bán</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 h-full">
          <div className="flex items-center h-full">
            <div className="text-purple-600 text-3xl mr-4">💰</div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Giá trị kho</p>
              <p className="text-2xl font-bold text-purple-700">
                {products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-purple-600 mt-1">Tổng giá trị hàng</p>
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
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảm giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá bán
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product, index) => (
                <tr key={product.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                  {/* Product Info */}
                  <td className="px-6 py-4">
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
                      <div className="ml-4 min-w-0">
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
                    <div className="text-sm font-medium text-gray-900 break-words">
                      {product.price.toLocaleString('vi-VN')}đ
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {product.discount || 0}%
                    </div>
                  </td>

                  {/* Final Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-emerald-600 break-words">
                      {product.discount && product.discount > 0 ? (
                        <>
                          {(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')}đ
                          <div className="text-xs text-gray-500 mt-1">
                            Giảm {product.discount}%
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-900">{product.price.toLocaleString('vi-VN')}đ</span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {product.stock || 0}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {!product.isAvailable ? (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Ngừng bán
                      </span>
                    ) : product.stock === 0 ? (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Hết hàng
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        Đang bán
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <div className="tooltip">
                        <button
                          onClick={() => router.push(`/product/${product.id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <span className="tooltip-text">Xem chi tiết</span>
                      </div>
                      <div className="tooltip">
                        <button
                          onClick={() => router.push(`/product/edit/${product.id}`)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <span className="tooltip-text">Chỉnh sửa</span>
                      </div>
                      <div className="tooltip">
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          disabled={deletingProduct === product.id}
                          className={`p-2 rounded-lg transition-colors ${
                            deletingProduct === product.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {deletingProduct === product.id ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                        <span className="tooltip-text">
                          {deletingProduct === product.id ? 'Đang xóa...' : 'Xóa sản phẩm'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Xác nhận xóa sản phẩm
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-gray-900">"{confirmDelete.productName}"</span>?
              <br />
              <span className="text-red-600 text-sm">Hành động này không thể hoàn tác.</span>
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
              >
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
