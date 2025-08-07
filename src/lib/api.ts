import { 
  UserResponseDto, 
  BuyerResponseDto, 
  SellerResponseDto,
  CreateUserDto,
  CreateBuyerDto,
  CreateSellerDto,
  UpdateUserDto,
  UpdateSellerDto,
  UserReviewsDto,
  BuyerOrdersDto,
  SellerOrdersDto,
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  OrderResponseDto,
  CreateOrderDto,
  UploadResponseDto,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewResponseDto,
} from '../types/dtos';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// User API
export const userApi = {
  // Get user profile with buyer/seller info
  async getProfile(userId: number): Promise<UserResponseDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/user/${userId}/profile`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  // Get user reviews
  async getUserReviews(userId: number): Promise<UserReviewsDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/user/${userId}/reviews`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch user reviews');
    return response.json();
  },

  // Create user (likely not needed as auth/register handles this)
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  // Update user
  async updateUser(userId: number, userData: UpdateUserDto): Promise<UserResponseDto> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },
};

// Buyer API
export const buyerApi = {
  // Get buyer orders
  async getBuyerOrders(buyerId: number): Promise<BuyerOrdersDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/buyer/${buyerId}/orders`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch buyer orders');
    return response.json();
  },

  // Create buyer profile
  async createBuyer(buyerData: CreateBuyerDto): Promise<BuyerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/buyers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(buyerData),
    });
    if (!response.ok) throw new Error('Failed to create buyer');
    return response.json();
  },

  // Get buyer profile
  async getBuyer(buyerId: number): Promise<BuyerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/buyers/${buyerId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch buyer');
    return response.json();
  },
};

// Seller API
export const sellerApi = {
  // Get seller orders
  async getSellerOrders(sellerId: number): Promise<SellerOrdersDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/seller/${sellerId}/orders`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch seller orders');
    return response.json();
  },

  // Create seller profile
  async createSeller(sellerData: CreateSellerDto): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sellerData),
    });
    if (!response.ok) throw new Error('Failed to create seller');
    return response.json();
  },

  // Update seller profile
  async updateSeller(sellerId: number, sellerData: UpdateSellerDto): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sellerData),
    });
    if (!response.ok) throw new Error('Failed to update seller');
    return response.json();
  },

  // Get seller profile
  async getSeller(sellerId: number): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch seller');
    return response.json();
  },

  // Get seller profile by user ID
  async getSellerByUserId(userId: number): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/by-user/${userId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch seller by user ID');
    return response.json();
  },
};

// Authentication helpers
export const authApi = {
  async login(email: string, password: string): Promise<{ user: UserResponseDto }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for httpOnly authentication
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async register(userData: CreateUserDto): Promise<UserResponseDto> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  async logout(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  },

  async getProfile(): Promise<UserResponseDto> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },
};

// Product API (can be added when product controller is implemented)
export const productApi = {
  // Get categories
  async getCategories(): Promise<{ id: number; name: string; description: string; }[]> {
    const response = await fetch(`${API_BASE_URL}/products/categories`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Get all products
  async getProducts(): Promise<ProductResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Get top discount products
  async getTopDiscountProducts(): Promise<ProductResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/products/top-discount`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch top discount products');
    return response.json();
  },

  // Get product by ID
  async getProduct(productId: number): Promise<ProductResponseDto> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  // Get products by seller
  async getProductsBySeller(sellerId: number): Promise<ProductResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/products/seller/${sellerId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch seller products');
    return response.json();
  },

  // Create product
  async createProduct(productData: CreateProductDto): Promise<ProductResponseDto> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  // Update product
  async updateProduct(productId: number, productData: UpdateProductDto): Promise<ProductResponseDto> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  // Delete product
  async deleteProduct(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },
};

// Order API  
export const orderApi = {
  // Get all orders
  async getOrders(): Promise<OrderResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  // Create order
  async createOrder(orderData: CreateOrderDto): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },
};

// Upload API
export const uploadApi = {
  // Upload file
  async uploadFile(file: File): Promise<UploadResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  },
};

// Review API
export const reviewApi = {
  // Get product reviews
  async getProductReviews(productId: number): Promise<ReviewResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch product reviews: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  // Get product rating stats
  async getProductRatingStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/stats`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch product rating stats');
    return response.json();
  },

  // Create review
  async createReview(reviewData: Omit<CreateReviewDto, 'buyerId'>): Promise<ReviewResponseDto> {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create Review API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // Try to parse error response as JSON to get the message
      let errorMessage = `Failed to create review: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // If can't parse as JSON, use the text as is
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      // Create a proper error object with response details for handling in UI
      const error = new Error(errorMessage);
      (error as any).response = {
        status: response.status,
        data: { message: errorMessage }
      };
      throw error;
    }
    return response.json();
  },

  // Update review
  async updateReview(reviewId: number, reviewData: UpdateReviewDto): Promise<ReviewResponseDto> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
  },

  // Delete review
  async deleteReview(reviewId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete review');
  },
};
