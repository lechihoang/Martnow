 import { createClient } from "@supabase/supabase-js";
import {
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  CreateOrderDto,
  CreateReviewDto,
  UpdateReviewDto,
  OrderResponseDto,
  ReviewResponseDto,
  CategoryDto,
  ApiResponse,
  BlogResponseDto,
  CreateBlogDto,
  UpdateBlogDto,
  BlogCommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  VoteResponseDto,
  SellerResponseDto,
  UpdateSellerDto,
  SellerStatsDto,
  CheckoutResultDto
} from '../types/dtos';
import { User, Stats } from '../types/entities';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function để get auth token
export async function getAuthToken(): Promise<string | null> {
  if (!supabase) {
    return null;
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Helper function để get authentication headers
export async function getAuthHeaders(): Promise<HeadersInit> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error('Supabase client not initialized');
  }
  
  try {
    console.log('🔍 getAuthHeaders: Getting session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ getAuthHeaders: Error getting session:', error);
      throw new Error('Failed to get session: ' + error.message);
    }
    
    console.log('🔍 getAuthHeaders: Session exists:', !!session);
    console.log('🔍 getAuthHeaders: Access token exists:', !!session?.access_token);
    
    const headers: HeadersInit = {};

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      console.log('✅ getAuthHeaders: Auth token added to headers');
    } else {
      console.warn('⚠️ getAuthHeaders: No access token found in session');
      throw new Error('No authentication token available');
    }

    return headers;
  } catch (error) {
    console.error('❌ getAuthHeaders: Error:', error);
    throw error;
  }
}

// Helper function để get headers with content type
export async function getHeadersWithContentType(): Promise<HeadersInit> {
  const authHeaders = await getAuthHeaders();
  return {
    ...authHeaders,
    'Content-Type': 'application/json',
  };
}

// Interface for error response data
interface ErrorResponseData {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

// Helper function để handle API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ErrorResponseData
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Interface for user profile response
interface UserProfileResponse {
  success: boolean;
  data?: User;
}

// Helper function để lấy user profile
export async function getUserProfile(): Promise<User | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers,
    });

    if (response.ok) {
      const data: UserProfileResponse = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
    }

    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching user profile';
    console.error('Error fetching user profile:', errorMessage);
    return null;
  }
}

// Helper function để handle response và errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ErrorResponseData;
    try {
      errorData = await response.json();
      console.error('❌ API Error Response:', errorData);
    } catch (e) {
      const parseError = e instanceof Error ? e.message : 'Failed to parse error response';
      console.error('❌ Failed to parse error response:', parseError);
      errorData = { message: response.statusText };
    }

    // Nếu là 401 Unauthorized, dispatch auth error event
    if (response.status === 401) {
      console.warn('Authentication failed - token may be expired');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authError', {
          detail: { message: 'Authentication expired', status: 401 }
        }));
      }
    }

    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  // Check if response has content to parse
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    // For delete operations or responses without JSON content
    return {} as T;
  }

  return response.json();
}

// Auth API - Sử dụng Supabase Auth
export const authApi = {
  async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, userData: Record<string, unknown>) {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  async resetPassword(accessToken: string, password: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken, password }),
    });
    return handleResponse(response);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return handleResponse(response);
  },
};

// Interface for update profile data
interface UpdateProfileData {
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  address?: string;
  phone?: string;
}

// User API
export const userApi = {
  async getProfile(): Promise<User | null> {
    return getUserProfile();
  },

  async getProfileById(userId: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Product API
export const productApi = {
  async getProducts(params?: Record<string, string>): Promise<ProductResponseDto[]> {
    const queryParams = new URLSearchParams(params).toString();
    // Fix: use 'product' instead of 'products' to match backend route
    const response = await fetch(`${API_BASE_URL}/product?${queryParams}`);
    return handleResponse(response);
  },

  async getProduct(id: number): Promise<ProductResponseDto> {
    const response = await fetch(`${API_BASE_URL}/product/${id}`);
    return handleResponse(response);
  },

  async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
    const response = await fetch(`${API_BASE_URL}/product`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateProduct(id: number, data: UpdateProductDto): Promise<ProductResponseDto> {
    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: 'PATCH',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getCategories(): Promise<CategoryDto[]> {
    const response = await fetch(`${API_BASE_URL}/product/categories`);
    return handleResponse(response);
  },

  async getSellerProducts(): Promise<ProductResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/product/seller`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getProductsBySellerId(sellerId: string): Promise<ProductResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/product/seller/${sellerId}`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getPopularProducts(limit: number = 10): Promise<ProductResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/product/popular?limit=${limit}`);
    return handleResponse(response);
  },
};

// Order API
export const orderApi = {
  async getUserOrders(userId: string): Promise<ApiResponse<OrderResponseDto[]>> {
    const response = await fetch(`${API_BASE_URL}/order/user/${userId}`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async createOrder(data: CreateOrderDto): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE_URL}/order`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async getOrder(id: number): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE_URL}/order/${id}`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cart checkout
  async checkout(items: Array<{productId: number, quantity: number, price: number}>, note?: string): Promise<ApiResponse<CheckoutResultDto>> {
    const response = await fetch(`${API_BASE_URL}/order/checkout`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify({ items, note }),
    });
    return handleResponse(response);
  },

  async cancelOrder(orderId: number): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/order/cancel/${orderId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getSellerOrders(sellerId: string): Promise<ApiResponse<OrderResponseDto[]>> {
    const response = await fetch(`${API_BASE_URL}/order/seller/${sellerId}`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Interface for payment response
interface PaymentResponse {
  paymentUrl: string;
  orderId: number;
}

// Interface for bank info
interface BankInfo {
  id: string;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  type: string;
  napasSupported: boolean;
}

// Payment API
export const paymentApi = {
  async createPayment(orderId: number): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payment/create/${orderId}`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify({}),
    });
    return handleResponse(response);
  },

  async getBankList(): Promise<BankInfo[]> {
    const response = await fetch(`${API_BASE_URL}/payment/banks`);
    return handleResponse(response);
  },
};

// Review API
export const reviewApi = {
  async getProductReviews(productId: number): Promise<ReviewResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    return handleResponse(response);
  },

  async createReview(productId: number, data: CreateReviewDto): Promise<ReviewResponseDto> {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateReview(reviewId: number, data: UpdateReviewDto): Promise<ReviewResponseDto> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteReview(reviewId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getProductRatingStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/stats`);
    return handleResponse(response);
  },

  async toggleHelpful(reviewId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Media API
export const mediaApi = {
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/media/avatar`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },

  async uploadProductImages(productId: string, files: File[]): Promise<{ imageUrls: string[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`${API_BASE_URL}/media/products/${productId}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },
};

// Blog API
export const blogApi = {
  async getBlogs(): Promise<BlogResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    return handleResponse(response);
  },

  async getBlog(id: number): Promise<BlogResponseDto> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
    return handleResponse(response);
  },

  async createBlog(data: CreateBlogDto): Promise<BlogResponseDto> {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateBlog(id: number, data: UpdateBlogDto): Promise<BlogResponseDto> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteBlog(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getBlogComments(blogId: number): Promise<BlogCommentDto[]> {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`);
    return handleResponse(response);
  },

  async createBlogComment(blogId: number, data: CreateCommentDto): Promise<BlogCommentDto> {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateComment(commentId: number, data: UpdateCommentDto): Promise<BlogCommentDto> {
    const response = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}`, {
      method: 'PUT',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteComment(commentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async voteBlog(blogId: number, voteType: 'up' | 'down'): Promise<VoteResponseDto> {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/vote`, {
      method: 'POST',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify({ voteType }),
    });
    return handleResponse(response);
  },

  async unvoteBlog(blogId: number): Promise<VoteResponseDto> {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/vote`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Seller API
export const sellerApi = {
  async getSellerProfile(): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateSellerProfile(data: UpdateSellerDto): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
      method: 'PATCH',
      headers: await getHeadersWithContentType(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async getSellerOrders(): Promise<OrderResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/sellers/orders`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getSellerStats(): Promise<SellerStatsDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/stats`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getSellerByUserId(userId: string): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/user/${userId}`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getAnalytics(sellerId: string): Promise<ApiResponse<Stats>> {
    const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/analytics`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getOrdersBySellerId(sellerId: string): Promise<ApiResponse<OrderResponseDto[]>> {
    const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}/orders`, {
      headers: await getAuthHeaders(),
    });
    return handleResponse(response);
  },
};



// Upload API
export const uploadApi = {
  async uploadFile(file: File, type: string = 'general'): Promise<{ status: string; data: Array<{ secureUrl: string }> }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },
};
