import { UserRole, OrderStatus } from './entities';

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
}

export interface UserResponseDto {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  buyer?: {
    id: number;
  };
  seller?: {
    id: number;
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
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
  sellerId: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  stock: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: number;
    shopName?: string;
    shopAddress?: string;
    user: {
      name: string;
      username: string;
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
  buyerId: number;
  addressId?: number;
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: number;
    user: {
      id: number;
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
        id: number;
        shopName?: string;
      };
    };
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
  userId: number;
  buyerId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  product: {
    id: number;
    name: string;
    imageUrl?: string;
    seller: {
      id: number;
      shopName?: string;
    };
  };
}

// ===============================
// SELLER DTOs
// ===============================
export interface CreateSellerDto {
  userId: number;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  description?: string;
}

export interface UpdateSellerDto {
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  description?: string;
}

export interface SellerResponseDto {
  id: number;
  userId: number;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  description?: string;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar?: string;
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
  id: number;
  userId: number;
  user: {
    id: number;
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
  sellerId: number;
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
