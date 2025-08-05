import { UserRole, OrderStatus } from './entities';

// User DTOs
export interface CreateUserDto {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
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
  buyerInfo?: {
    id: number;
    createdAt: Date;
  };
  sellerInfo?: {
    id: number;
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    description?: string;
    createdAt: Date;
  };
}

// Buyer DTOs
export interface CreateBuyerDto {
  userId: number;
}

export interface BuyerResponseDto {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  totalOrders: number;
  totalReviews: number;
}

// Seller DTOs
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
  createdAt: Date;
  updatedAt: Date;
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
}

// Order DTOs
export interface CreateOrderDto {
  buyerId: number;
  addressId?: number;
  note?: string;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
  price: number;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  note?: string;
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
      name: string;
      username: string;
      email: string;
    };
  };
  address?: {
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
      name: string;
      imageUrl?: string;
      seller: {
        id: number;
        shopName?: string;
      };
    };
  }[];
}

// Review DTOs
export interface CreateReviewDto {
  userId: number;
  buyerId: number;
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
  buyer: {
    id: number;
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

// Product DTOs
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
  images: {
    id: number;
    imageUrl: string;
  }[];
  reviews: {
    id: number;
    rating: number;
    comment?: string;
    createdAt: Date;
    user: {
      name: string;
      username: string;
      avatar?: string;
    };
  }[];
  averageRating: number;
  totalReviews: number;
  totalSold: number;
}

// Address DTOs
export interface CreateAddressDto {
  userId: number;
  buyerId: number;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  addressLine?: string;
  city?: string;
  district?: string;
  ward?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AddressResponseDto {
  id: number;
  userId: number;
  buyerId: number;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Activity DTOs
export interface UserReviewsDto {
  userId: number;
  reviews: {
    id: number;
    productId: number;
    productName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
}

export interface BuyerOrdersDto {
  buyerId: number;
  orders: {
    id: number;
    totalPrice: number;
    status: string;
    createdAt: Date;
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
    orderId: number;
    buyerName: string;
    totalPrice: number;
    status: string;
    createdAt: Date;
    items: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[];
  }[];
}

// Seller Stats DTO
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
