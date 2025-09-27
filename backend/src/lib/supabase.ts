import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug logging
console.log('🔍 Supabase Config Check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set');
console.log(
  'SUPABASE_SERVICE_ROLE_KEY:',
  supabaseServiceKey ? '✅ Set' : '❌ Not set',
);

// Only create client if environment variables are available
export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

if (!supabase) {
  console.error(
    '❌ Supabase client not initialized - missing environment variables',
  );
} else {
  console.log('✅ Supabase client initialized successfully');
}

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
  avatar_url?: string;
}

// JWT payload interface
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}
