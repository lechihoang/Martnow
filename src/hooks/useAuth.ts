import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session, createClient } from '@supabase/supabase-js';

// Singleton Supabase client - chỉ tạo 1 lần
let supabase: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
};

interface AuthState {
  user: User | null;
  session: Session | null;
  error: string | null;
}

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  error: string | null;
  signin: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string, username: string) => Promise<{ error: string | null }>;
  signout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    const supabase = getSupabaseClient();
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthState(prev => ({
            ...prev,
            error: error.message
          }))
          return
        }

        if (session?.user) {
          console.log('Auth state change: INITIAL_SESSION', session.user.id)
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session
          }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setAuthState(prev => ({
          ...prev,
          error: 'Failed to initialize authentication'
        }))
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        if (session?.user) {
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            session,
            error: null
          }))
        } else {
          setAuthState(prev => ({
            ...prev,
            user: null,
            session: null,
            error: null
          }))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signin = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, error: null }))

      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message
        }))
        return { error: error.message }
      }
      
      // Chuyển hướng về trang chủ sau khi đăng nhập thành công
      console.log('Đăng nhập thành công, đang chuyển hướng về /')
      window.location.href = '/'
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }))
      return { error: errorMessage }
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string, username: string) => {
    try {
      setAuthState(prev => ({ ...prev, error: null }))

      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
            role: 'BUYER',
            email_verified: true
          }
        }
      })

      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message
        }))
        return { error: error.message }
      }
      
      // Chuyển hướng về trang chủ sau khi đăng ký thành công
      console.log('Đăng ký thành công, đang chuyển hướng về /')
      window.location.href = '/'
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      setAuthState(prev => ({
        ...prev,
        error: errorMessage
      }))
      return { error: errorMessage }
    }
  }, [])

  const signout = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut()
      
      setAuthState({
        user: null,
        session: null,
        error: null,
      })
      
      // Chuyển hướng về trang chủ sau khi đăng xuất thành công
      console.log('Đăng xuất thành công, đang chuyển hướng về trang chủ')
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // Fallback redirection
      window.location.href = '/'
    }
  }, [])

  // Memoize return values to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => authState.user, [authState.user]);
  const memoizedSession = useMemo(() => authState.session, [authState.session]);

  return {
    user: memoizedUser,
    session: memoizedSession,
    error: authState.error,
    signin,
    signup,
    signout,
  }
}
