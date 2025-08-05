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
  SellerOrdersDto
} from '../types/dtos';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// User API
export const userApi = {
  // Get user profile with buyer/seller info
  async getProfile(userId: number): Promise<UserResponseDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/user/${userId}/profile`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  // Get user reviews
  async getUserReviews(userId: number): Promise<UserReviewsDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/user/${userId}/reviews`);
    if (!response.ok) throw new Error('Failed to fetch user reviews');
    return response.json();
  },

  // Create user
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE_URL}/user-activity/buyer/${buyerId}/orders`);
    if (!response.ok) throw new Error('Failed to fetch buyer orders');
    return response.json();
  },

  // Create buyer profile
  async createBuyer(buyerData: CreateBuyerDto): Promise<BuyerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/buyers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyerData),
    });
    if (!response.ok) throw new Error('Failed to create buyer');
    return response.json();
  },

  // Get buyer profile
  async getBuyer(buyerId: number): Promise<BuyerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/buyers/${buyerId}`);
    if (!response.ok) throw new Error('Failed to fetch buyer');
    return response.json();
  },
};

// Seller API
export const sellerApi = {
  // Get seller orders
  async getSellerOrders(sellerId: number): Promise<SellerOrdersDto> {
    const response = await fetch(`${API_BASE_URL}/user-activity/seller/${sellerId}/orders`);
    if (!response.ok) throw new Error('Failed to fetch seller orders');
    return response.json();
  },

  // Create seller profile
  async createSeller(sellerData: CreateSellerDto): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      body: JSON.stringify(sellerData),
    });
    if (!response.ok) throw new Error('Failed to update seller');
    return response.json();
  },

  // Get seller profile
  async getSeller(sellerId: number): Promise<SellerResponseDto> {
    const response = await fetch(`${API_BASE_URL}/sellers/${sellerId}`);
    if (!response.ok) throw new Error('Failed to fetch seller');
    return response.json();
  },
};

// Authentication helpers
export const authApi = {
  async login(username: string, password: string): Promise<{ user: UserResponseDto; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async register(userData: CreateUserDto): Promise<{ user: UserResponseDto; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },
};

// Helper function to get authorization headers
export const getAuthHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('auth_token');
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};
