export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Buyer {
  id: string;
  user?: User;
}

export interface Seller {
  id: string;
  shopName?: string;
  description?: string;
  user?: User;
}

export interface Product {
  id: number;
  sellerId: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  discountedPrice: number;
  isAvailable: boolean;
  stock: number;
  discount: number;
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    shopName?: string;
    user: {
      name: string;
      address?: string;
      phone?: string;
    };
  };
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: number;
  buyerId: string;
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  paymentReference?: string;
  paidAt?: string;
  createdAt: string;
  buyer?: Buyer;
  items?: OrderItem[];
}

export interface OrderItem {
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
  product?: Product;
}

export interface Review {
  id: number;
  buyerId: string;
  productId: number;
  rating: number;
  comment?: string;
  helpfulCount: number;
  createdAt: string;
  buyer?: Buyer;
  product?: Product;
}

export interface Favorite {
  buyerId: string;
  productId: number;
  buyer?: Buyer;
  product?: Product;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  featuredImage?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  comments?: BlogComment[];
  votes?: BlogVote[];
}

export interface BlogComment {
  id: number;
  content: string;
  userId: string;
  blogId: number;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  blog?: Blog;
  parent?: BlogComment;
  replies?: BlogComment[];
}

export interface BlogVote {
  id: number;
  voteType: 'up' | 'down';
  userId: string;
  blogId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  blog?: Blog;
}

export interface Stats {
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  totalCustomers: number;
  monthlySales: Array<{
    month: string;
    sales: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}
