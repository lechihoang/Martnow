import { useEffect, useState } from 'react';
import { authApi } from '../lib/api';
import { UserRole } from '../types/entities';
import { UserResponseDto } from '../types/dtos';

function useUser() {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get profile from httpOnly cookie
      const profile = await authApi.getProfile();
      
      if (profile) {
        // Map userId to id if needed for consistency with frontend expectation
        const profileWithId = {
          ...profile,
          id: profile.id || profile.id
        };
        
        // Store in localStorage for quick access across page reloads
        localStorage.setItem('user', JSON.stringify(profileWithId));
        setUser(profileWithId as UserResponseDto);
      }
    } catch {
      // If no valid token/session, clear localStorage
      localStorage.removeItem('user');
      setUser(null);
      setError('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login(email, password);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        
        // Dispatch custom event để các component khác biết user đã login
        window.dispatchEvent(new CustomEvent('userStateChanged', { 
          detail: { user: response.user, action: 'login' } 
        }));
        
        return response.user;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      
      // Dispatch custom event để các component khác biết user đã logout
      window.dispatchEvent(new CustomEvent('userStateChanged', { 
        detail: { user: null, action: 'logout' } 
      }));
    }
  };

  const register = async (userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.register(userData);
      if (response) {
        localStorage.setItem('user', JSON.stringify(response));
        setUser(response);
        
        // Dispatch custom event để các component khác biết user đã register
        window.dispatchEvent(new CustomEvent('userStateChanged', { 
          detail: { user: response, action: 'register' } 
        }));
        
        return response;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First check localStorage for quick load
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const storedUser = JSON.parse(userStr);
          // Ensure stored user has id field mapped correctly
          const userWithId = {
            ...storedUser,
            id: storedUser.id || storedUser.userId
          };
          setUser(userWithId);
        } catch {
          localStorage.removeItem('user');
        }
      }
      
      // Then verify with server
      fetchUser();

      // Listen for user state changes
      const handleUserStateChange = (event: CustomEvent) => {
        const { user: newUser, action } = event.detail;
        if (action === 'login' || action === 'register') {
          setUser(newUser);
          setLoading(false);
        } else if (action === 'logout') {
          setUser(null);
          setLoading(false);
        }
      };

      window.addEventListener('userStateChanged', handleUserStateChange as EventListener);

      return () => {
        window.removeEventListener('userStateChanged', handleUserStateChange as EventListener);
      };
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    refetch: fetchUser,
  };
}

export default useUser;
