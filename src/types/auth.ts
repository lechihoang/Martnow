// User roles enum
export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

// JWT payload interface
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}
