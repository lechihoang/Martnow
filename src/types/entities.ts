// Auto-generated from backend entities

export interface Address {
  id: number;
  user: User;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  isDefault: boolean;
}

export interface Buyer {
  id: number;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  products: Product[];
}

export interface OrderItem {
  id: number;
  order: Order;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  buyer: Buyer;
  address: Address;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface Product {
  id: number;
  seller: Seller;
  category: Category;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  stock: number;
  discount: number;
}

export interface Review {
  id: number;
  buyer: Buyer;
  product: Product;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Seller {
  id: number;
  user: User;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  description: string;
  products: Product[];
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  password: string;
}
