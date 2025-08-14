import type { Product } from '../types/entities';

// Format giá tiền
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// Tính giá sau khi giảm
export const calculateDiscountedPrice = (price: number, discount: number): number => {
  return price - (price * discount / 100);
};

// Format discount percentage
export const formatDiscount = (discount: number): string => {
  return `-${discount}%`;
};

// Kiểm tra sản phẩm có sẵn
export const isProductAvailable = (product: Product): boolean => {
  return product.isAvailable && product.stock > 0;
};

// Tính trạng thái stock
export const getStockStatus = (stock: number, isAvailable: boolean) => {
  if (!isAvailable || stock === 0) {
    return { status: 'out-of-stock', text: 'Hết hàng', color: 'red' };
  }
  
  if (stock <= 5) {
    return { status: 'low-stock', text: 'Sắp hết', color: 'orange' };
  }
  
  if (stock <= 20) {
    return { status: 'limited', text: 'Còn ít', color: 'yellow' };
  }
  
  return { status: 'in-stock', text: 'Còn hàng', color: 'green' };
};

// Format product code
export const formatProductCode = (id: number): string => {
  return `SP${id.toString().padStart(6, '0')}`;
};

// Calculate average rating (placeholder for future)
export const calculateAverageRating = (reviews: { rating: number }[]): number => {
  if (!reviews || reviews.length === 0) return 0;
  
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
};

// Format stock display text
export const formatStockText = (stock: number, isAvailable: boolean): string => {
  if (!isAvailable || stock === 0) {
    return 'Hết hàng';
  }
  
  if (stock <= 5) {
    return `Chỉ còn ${stock} sản phẩm`;
  }
  
  return `${stock} sản phẩm có sẵn`;
};

// Validate product data
export const validateProduct = (product: Partial<Product>): string[] => {
  const errors: string[] = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Tên sản phẩm không được để trống');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Giá sản phẩm phải lớn hơn 0');
  }
  
  if (!product.description || product.description.trim().length === 0) {
    errors.push('Mô tả sản phẩm không được để trống');
  }
  
  if (product.stock !== undefined && product.stock < 0) {
    errors.push('Số lượng tồn kho không được âm');
  }
  
  if (product.discount !== undefined && (product.discount < 0 || product.discount > 100)) {
    errors.push('Phần trăm giảm giá phải từ 0% đến 100%');
  }
  
  return errors;
};
