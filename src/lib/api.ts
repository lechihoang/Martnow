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

// Helper function để handle API errors, đặc biệt là authentication errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function để handle response và errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    // Nếu là 401 Unauthorized, có thể redirect đến login
    if (response.status === 401) {
      // Có thể dispatch logout event hoặc redirect
      console.warn('Authentication failed - token may be expired');
    }

    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

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
  // Get user orders (new method using userId)
  async getUserOrders(userId: number): Promise<BuyerOrdersDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/user/${userId}/orders`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch user orders');
    return response.json();
  },

  // Legacy method - deprecated
  async getBuyerOrders(buyerId: number): Promise<BuyerOrdersDto> {
    console.warn('getBuyerOrders is deprecated. Use getUserOrders instead.');
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
    console.log('📡 API: Sending login request to:', `${API_BASE_URL}/auth/login`);
    console.log('📡 API: Request data:', { email, password: '***' });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for httpOnly authentication
      body: JSON.stringify({ email, password }),
    });
    
    console.log('📥 API: Response status:', response.status);
    console.log('📥 API: Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API: Login failed with:', errorText);
      throw new Error(`Login failed: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ API: Login successful, data:', data);
    return data;
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
      method: 'GET', // Đổi từ POST thành GET
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },

  // Thêm method để check auth status
  async getStatus(): Promise<{ isAuthenticated: boolean; user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get auth status');
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

// Media/Upload API
export const uploadApi = {
  // Upload single file for entity
  async uploadFile(
    file: File, 
    entityType: string = 'general', 
    entityId?: number
  ): Promise<any> {
    const formData = new FormData();
    formData.append('files', file); // Backend expects 'files'
    formData.append('entityType', entityType);
    if (entityId) {
      formData.append('entityId', entityId.toString());
    }
    
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  },

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[], 
    entityType: string, 
    entityId: number,
    isPrimary?: boolean[]
  ): Promise<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('entityType', entityType);
    formData.append('entityId', entityId.toString());
    if (isPrimary) {
      isPrimary.forEach((primary, index) => {
        formData.append(`isPrimary[${index}]`, primary.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload files');
    return response.json();
  },

  // Get media files for entity
  async getMediaFiles(entityType: string, entityId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/media/${entityType}/${entityId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get media files');
    return response.json();
  },

  // Update media files (add/remove)
  async updateMediaFiles(
    entityType: string,
    entityId: number,
    options: {
      filesToAdd?: File[];
      filesToDelete?: number[];
      primaryFileId?: number;
    }
  ): Promise<any> {
    const formData = new FormData();
    
    if (options.filesToAdd) {
      options.filesToAdd.forEach(file => formData.append('files', file));
    }
    
    if (options.filesToDelete) {
      formData.append('filesToDelete', JSON.stringify(options.filesToDelete));
    }
    
    if (options.primaryFileId) {
      formData.append('primaryFileId', options.primaryFileId.toString());
    }
    
    const response = await fetch(`${API_BASE_URL}/media/${entityType}/${entityId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update media files');
    return response.json();
  },

  // Set primary media file
  async setPrimaryMedia(mediaFileId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/media/primary/${mediaFileId}`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to set primary media');
    return response.json();
  },

  // Delete all media for entity
  async deleteAllMedia(entityType: string, entityId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/media/${entityType}/${entityId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete media files');
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
      } catch {
        // If can't parse as JSON, use the text as is
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      // Create a proper error object with response details for handling in UI
      const error = new Error(errorMessage) as Error & {
        response: {
          status: number;
          data: { message: string };
        };
      };
      error.response = {
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

  // Mark review as helpful
  async markReviewHelpful(reviewId: number): Promise<{ helpfulCount: number }> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to mark review as helpful');
    return response.json();
  },

  // Get top reviews for product
  async getTopProductReviews(productId: number, limit: number = 5): Promise<ReviewResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/top?limit=${limit}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch top product reviews');
    return response.json();
  },
};

// Favorites API
export const favoritesApi = {
  // Get user's favorite products
  async getFavorites(): Promise<ProductResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      credentials: 'include',
    });
    
    const data = await handleResponse<{ message: string; data: ProductResponseDto[] }>(response);
    return data.data || []; // API trả về { message, data }
  },

  // Add product to favorites
  async addToFavorites(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
      method: 'POST',
      credentials: 'include',
    });
    await handleResponse<{ message: string; data?: any }>(response);
  },

  // Remove product from favorites
  async removeFromFavorites(productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await handleResponse<{ message: string }>(response);
  },

  // Check if product is favorite
  async isFavorite(productId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/check/${productId}`, {
        credentials: 'include',
      });
      const data = await handleResponse<{ isFavorite: boolean }>(response);
      return data.isFavorite;
    } catch (error) {
      // If there's an auth error or other error, assume not favorite
      console.warn('Error checking favorite status:', error);
      return false;
    }
  },

  // Get favorite status for multiple products
  async getFavoriteStatus(productIds: number[]): Promise<Record<number, boolean>> {
    try {
      const promises = productIds.map(id => this.isFavorite(id));
      const results = await Promise.all(promises);
      
      const favoriteStatus: Record<number, boolean> = {};
      productIds.forEach((id, index) => {
        favoriteStatus[id] = results[index];
      });
      
      return favoriteStatus;
    } catch (error) {
      console.error('Error fetching favorite status:', error);
      return {};
    }
  },
};

// Payment API  
export const paymentApi = {
  // Create payment URL
  async createPayment(orderId: number, options?: { locale?: string }) {
    const response = await fetch(`${API_BASE_URL}/payment/create/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(options || {})
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    return response.json();
  },

  // Query payment status
  async queryPayment(txnRef: string, txnDate: string) {
    const response = await fetch(`${API_BASE_URL}/payment/query/${txnRef}/${txnDate}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to query payment');
    }

    return response.json();
  },

  // Refund payment
  async refundPayment(txnRef: string, data: { amount: number; reason: string }) {
    const response = await fetch(`${API_BASE_URL}/payment/refund/${txnRef}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to refund payment');
    }

    return response.json();
  }
};
