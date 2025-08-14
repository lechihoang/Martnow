import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserResponseDto, 
  UserReviewsDto,
  BuyerOrdersDto,
  SellerOrdersDto
} from '../types/dtos';
import { UserRole } from '../types/entities';
import { userApi, buyerApi, sellerApi } from '../lib/api';

// Enhanced user hook with buyer/seller info
export const useUserProfile = (userId?: number) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const userData = await userApi.getProfile(userId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
};

// Hook for user reviews
export const useUserReviews = (userId?: number) => {
  const [reviews, setReviews] = useState<UserReviewsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const reviewData = await userApi.getUserReviews(userId);
        setReviews(reviewData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  return { reviews, loading, error };
};

// Hook for buyer orders
export const useBuyerOrders = (buyerId?: number) => {
  const [orders, setOrders] = useState<BuyerOrdersDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!buyerId) return;
    setLoading(true);
    setError(null);
    try {
      const orderData = await buyerApi.getBuyerOrders(buyerId);
      setOrders(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};

// Hook for seller orders
export const useSellerOrders = (sellerId?: number) => {
  const [orders, setOrders] = useState<SellerOrdersDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    try {
      const orderData = await sellerApi.getSellerOrders(sellerId);
      setOrders(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};

// Enhanced user hook with role-based data
export const useEnhancedUser = (userId?: number) => {
  const { user, loading: userLoading, error: userError } = useUserProfile(userId);
  const { reviews, loading: reviewsLoading } = useUserReviews(userId);
  
  // Only fetch orders if user has the appropriate role
  const shouldFetchBuyerOrders = user?.role === UserRole.BUYER || user?.role === UserRole.BOTH;
  const shouldFetchSellerOrders = user?.role === UserRole.SELLER || user?.role === UserRole.BOTH;
  
  const { orders: buyerOrders, loading: buyerOrdersLoading } = useBuyerOrders(
    shouldFetchBuyerOrders ? user?.buyer?.id : undefined
  );
  
  const { orders: sellerOrders, loading: sellerOrdersLoading } = useSellerOrders(
    shouldFetchSellerOrders ? user?.seller?.id : undefined
  );

  const loading = userLoading || reviewsLoading || buyerOrdersLoading || sellerOrdersLoading;

  const isBuyer = user?.role === UserRole.BUYER || user?.role === UserRole.BOTH;
  const isSeller = user?.role === UserRole.SELLER || user?.role === UserRole.BOTH;

  return useMemo(() => ({
    user,
    reviews,
    buyerOrders: isBuyer ? buyerOrders : null,
    sellerOrders: isSeller ? sellerOrders : null,
    loading,
    error: userError,
    isBuyer,
    isSeller,
  }), [user, reviews, buyerOrders, sellerOrders, loading, userError, isBuyer, isSeller]);
};

// Hook for user management (create/update roles)
export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const becomeSeller = async (userId: number, sellerData: { 
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    description?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      // First update user role
      await userApi.updateUser(userId, { role: UserRole.BOTH });
      
      // Then create seller profile
      await sellerApi.createSeller({
        userId,
        ...sellerData,
      });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to become seller');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const becomeBuyer = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      // First update user role
      await userApi.updateUser(userId, { role: UserRole.BOTH });
      
      // Then create buyer profile
      await buyerApi.createBuyer({ userId });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to become buyer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    becomeSeller,
    becomeBuyer,
    loading,
    error,
  };
};
