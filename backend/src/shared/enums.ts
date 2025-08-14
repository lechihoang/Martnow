export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  BOTH = 'both',
}

export enum OrderStatus {
  // Trạng thái cho Buyer (chỉ hiển thị đơn đã thanh toán)
  PAID = 'đã thanh toán',
  
  // Trạng thái cho Seller
  SELLING = 'đang bán',
  SOLD_OUT = 'đã bán hết',
  
  // Trạng thái nội bộ (không hiển thị cho user)
  WAITING_PAYMENT = 'chờ thanh toán',
  CANCELLED = 'cancelled',
}

export enum ProductStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}
