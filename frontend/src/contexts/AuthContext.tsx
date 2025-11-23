'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session, createClient } from '@supabase/supabase-js';

// Singleton Supabase client
let supabase: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string, role: string) => Promise<{ error: string | null }>;
  signout: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state - runs once on app load
  useEffect(() => {
    const supabase = getSupabaseClient();

    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthProvider - Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Session found:', session.user.id);
          setUser(session.user);
          setSession(session);
        } else {
          console.log('ℹ️ No session found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.id);

        if (session?.user) {
          setUser(session.user);
          setSession(session);
          setError(null);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      console.log('✅ Sign in successful, redirecting to /');
      window.location.href = '/';
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: string) => {
    try {
      setError(null);

      // Call backend signup API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role: role.toUpperCase(), // Convert to BUYER/SELLER
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error?.message || 'Signup failed';
        setError(errorMessage);
        return { error: errorMessage };
      }

      console.log('✅ Sign up successful, redirecting to /');
      window.location.href = '/';
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, []);

  const signout = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();

      setUser(null);
      setSession(null);
      setError(null);

      console.log('✅ Sign out successful, redirecting to /');
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Error signing out:', error);
      window.location.href = '/';
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      const supabase = getSupabaseClient();

      console.log('🔐 Initiating Google OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        setError(error.message);
        return { error: error.message };
      }

      // Note: The redirect happens automatically, no need to manually redirect
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      console.error('❌ Error during Google sign in:', errorMessage);
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    error,
    signin,
    signup,
    signout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
