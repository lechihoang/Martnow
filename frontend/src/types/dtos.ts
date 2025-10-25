// User roles enum
export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',      // Chờ thanh toán
  PAID = 'paid',           // Đã thanh toán
  CANCELLED = 'cancelled', // Hủy
}

// ===============================
// USER DTOs
// ===============================
export interface CreateUserDto {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  avatar?: string;
  address?: string;
  phone?: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  buyer?: {
    id: string;
  };
  seller?: {
    id: string;
    shopName?: string;
    description?: string;
  };
  // Backend returns these fields
  buyerInfo?: {
    id: string;
  };
  sellerInfo?: {
    id: string;
    shopName?: string;
    description?: string;
  };
}

// ===============================
// PRODUCT DTOs
// ===============================
export interface CreateProductDto {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  stock: number;
  discount?: number;
}

export interface UpdateProductDto {
  categoryId?: number;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  stock?: number;
  discount?: number;
}

export interface ProductResponseDto {
  id: number;
  sellerId: string;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice: number; // Computed field for price after discount
  imageUrl?: string;
  isAvailable: boolean;
  stock: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    shopName?: string;
    user: {
      name: string;
      username: string;
      address?: string;
      phone?: string;
    };
  };
  category: {
    id: number;
    name: string;
    description?: string;
  };
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;
}

// ===============================
// ORDER DTOs
// ===============================
export interface CreateOrderDto {
  addressId?: number;
  totalPrice: number;
  note?: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface OrderResponseDto {
  id: number;
  buyerId: string;
  addressId?: number;
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  address?: {
    id: number;
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    phone: string;
  };
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      imageUrl?: string;
      seller: {
        id: string;
        shopName?: string;
      };
    };
  }[];
}

export interface CheckoutResultDto {
  orders: OrderResponseDto[];
  totalAmount: number;
  paymentRequired: boolean;
  sellerCount: number;
  // Payment URLs for VNPay
  primaryPaymentUrl?: string; // Main payment URL for all orders
  paymentInfos?: {
    orderId: number;
    amount: number;
    paymentUrl: string;
  }[];
}

// ===============================
// REVIEW DTOs
// ===============================
export interface CreateReviewDto {
  productId: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface ReviewResponseDto {
  id: number;
  buyerId: string;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  // User info directly from backend
  buyerName: string;
  buyerAvatar?: string;
  // Product info directly from backend
  productName: string;
}

// ===============================
// SELLER DTOs
// ===============================
export interface CreateSellerDto {
  userId: number;
  shopName?: string;
  description?: string;
}

export interface UpdateSellerDto {
  shopName?: string;
  description?: string;
}

export interface SellerResponseDto {
  id: string;
  userId: string;
  shopName?: string;
  description?: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    address?: string;
    phone?: string;
  };
  totalProducts: number;
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ===============================
// BUYER DTOs
// ===============================
export interface CreateBuyerDto {
  userId: number;
}

export interface BuyerResponseDto {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  totalOrders: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===============================
// UTILITY DTOs
// ===============================
export interface UploadResponseDto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
}

export interface AddressDto {
  id: number;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
}

// ===============================
// API RESPONSE WRAPPERS
// ===============================
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AuthResponse {
  user: UserResponseDto;
}

// ===============================
// USER ACTIVITY DTOs
// ===============================
export interface UserReviewsDto {
  userId: number;
  reviews: {
    id: number;
    productId: number;
    productName: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  }[];
}

export interface BuyerOrdersDto {
  buyerId: number;
  orders: {
    id: number;
    totalPrice: number;
    status: OrderStatus;
    createdAt: Date;
    itemCount: number;
    items: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[];
  }[];
}

export interface SellerOrdersDto {
  sellerId: number;
  orders: {
    id: number;
    buyerName: string;
    totalPrice: number;
    status: OrderStatus;
    createdAt: Date;
    itemCount: number;
  }[];
}

// ===============================
// STATS DTOs
// ===============================
export interface SellerStatsDto {
  id: number;
  sellerId: string;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===============================
// BLOG DTOs
// ===============================
export interface CreateBlogDto {
  title: string;
  content: string;
  imageUrl?: string;
  featuredImage?: string;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  imageUrl?: string;
  featuredImage?: string;
}

export interface BlogResponseDto {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  featuredImage?: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
  };
  comments: BlogCommentDto[];
  upvoteCount?: number;
  downvoteCount?: number;
  userVote?: 'up' | 'down' | null;
}

export interface CreateCommentDto {
  content: string;
  // Removed parentId since we no longer support reply functionality
  // parentId?: number;
}

export interface UpdateCommentDto {
  content: string;
}

export interface BlogCommentDto {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  user: {
    id: string;
    name: string;
  };
  // Removed parentId and replies since we no longer support reply functionality
  // parentId?: number;
  // replies: BlogCommentDto[];
}

export interface VoteBlogDto {
  voteType: 'up' | 'down';
}

export interface VoteResponseDto {
  upvoteCount: number;
  downvoteCount: number;
  userVote: 'up' | 'down' | null;
}
