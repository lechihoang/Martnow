// Auto-generated from backend entities

// Enums
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  BOTH = 'both',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProductStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

// Base interface for all entities
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  password: string;
  avatar?: string;
  buyer?: Buyer;
  seller?: Seller;
  reviews: Review[];
}

export interface Buyer extends BaseEntity {
  userId: number;
  user: User;
  orders: Order[];
  reviews: Review[];
  addresses: Address[];
}

export interface Seller extends BaseEntity {
  userId: number;
  user: User;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  description?: string;
  products: Product[];
  stats?: SellerStats;
}

export interface SellerStats extends BaseEntity {
  sellerId: number;
  seller: Seller;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
}

// Alias for compatibility with existing code
export type Stats = Pick<SellerStats, 'totalOrders' | 'totalRevenue' | 'totalProducts' | 'pendingOrders' | 'completedOrders' | 'averageRating' | 'totalReviews'>;

export interface Address extends BaseEntity {
  userId: number;
  buyerId: number;
  user: User;
  buyer: Buyer;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  isDefault: boolean;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  products: Product[];
}

export interface Product extends BaseEntity {
  sellerId: number;
  categoryId: number;
  seller: Seller;
  category: Category;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  images: ProductImage[];
  isAvailable: boolean;
  stock: number;
  discount: number;
  reviews: Review[];
  orderItems: OrderItem[];
}

export interface ProductImage extends BaseEntity {
  productId: number;
  product: Product;
  imageData: string; // base64 string
  mimeType: string;
  originalName?: string;
  fileSize: number;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface Order extends BaseEntity {
  buyerId: number;
  addressId?: number;
  buyer: Buyer;
  address?: Address;
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  items: OrderItem[];
}

export interface OrderItem extends BaseEntity {
  orderId: number;
  productId: number;
  order: Order;
  product: Product;
  quantity: number;
  price: number;
}

export interface Review extends BaseEntity {
  userId: number;
  buyerId: number;
  productId: number;
  user: User;
  buyer: Buyer;
  product: Product;
  rating: number;
  comment?: string;
}
