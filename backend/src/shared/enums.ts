// User roles - đơn giản chỉ 2 role chính
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

// Order status - các trạng thái đơn hàng
export enum OrderStatus {
  PENDING = 'pending', // Đơn hàng đang chờ thanh toán (tạm thời)
  PAID = 'paid', // Đã thanh toán (hiển thị cho cả buyer và seller)
  CANCELLED = 'cancelled', // Đã hủy
}

// Product status - chỉ cần biết còn hàng hay hết hàng
export enum ProductStatus {
  IN_STOCK = 'in_stock', // Còn hàng
  OUT_OF_STOCK = 'out_of_stock', // Hết hàng
}
