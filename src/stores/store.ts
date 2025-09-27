import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductResponseDto } from '@/types/dtos';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CartItem {
  product: ProductResponseDto;
  quantity: number;
}

interface StoreState {
  // Cart
  cartItems: CartItem[];
  addToCart: (product: ProductResponseDto, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotalPrice: () => number;
  getCartTotalItems: () => number;
  getCartItemQuantity: (productId: number) => number;
  
  // Favorites - Hybrid approach (local + backend sync)
  favoriteProducts: ProductResponseDto[];
  favoriteIds: number[]; // Array instead of Set for persistence
  addToFavorites: (product: ProductResponseDto) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
  clearFavorites: () => void;
  isFavorite: (productId: number) => boolean;
  getFavoritesCount: () => number;
  syncFavoritesWithBackend: () => Promise<void>;
  fetchFavoritesFromBackend: () => Promise<void>;
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart state
      cartItems: [],
      favoriteProducts: [],
      favoriteIds: [],

      // Cart actions
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.product.id === product.id
          );
          
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            return { 
              cartItems: [...state.cartItems, { product, quantity }] 
            };
          }
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.product.id !== productId
          ),
        }));
      },

      updateCartQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              cartItems: state.cartItems.filter(
                (item) => item.product.id !== productId
              ),
            };
          }
          
          return {
            cartItems: state.cartItems.map((item) =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ cartItems: [] }),

      getCartTotalPrice: () => {
        return get().cartItems.reduce(
          (total, item) => total + (item.product.discountedPrice || item.product.price) * item.quantity,
          0
        );
      },

      getCartTotalItems: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0);
      },

      getCartItemQuantity: (productId) => {
        const item = get().cartItems.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
      },

      // Favorites actions - Hybrid approach
      addToFavorites: async (product) => {
        const state = get();
        const isCurrentlyFavorite = state.favoriteIds.includes(product.id);
        
        if (isCurrentlyFavorite) {
          // Remove from favorites
          await get().removeFromFavorites(product.id);
        } else {
          // Add to favorites
          set((state) => ({
            favoriteProducts: [...state.favoriteProducts, product],
            favoriteIds: [...state.favoriteIds, product.id],
          }));

          // Sync with backend
          try {
            await fetch(`${API_BASE_URL}/favorites/${product.id}/toggle`, {
              method: 'POST',
              credentials: 'include',
            });
          } catch (error) {
            console.error('Failed to sync favorite with backend:', error);
            // Revert local state if backend fails
            set((state) => ({
              favoriteProducts: state.favoriteProducts.filter(p => p.id !== product.id),
              favoriteIds: state.favoriteIds.filter(id => id !== product.id),
            }));
          }
        }
      },

      removeFromFavorites: async (productId) => {
        set((state) => ({
          favoriteProducts: state.favoriteProducts.filter(p => p.id !== productId),
          favoriteIds: state.favoriteIds.filter(id => id !== productId),
        }));

        // Sync with backend
        try {
          await fetch(`${API_BASE_URL}/favorites/${productId}/toggle`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Failed to sync favorite removal with backend:', error);
        }
      },

      clearFavorites: () => set({ favoriteProducts: [], favoriteIds: [] }),

      isFavorite: (productId) => {
        return get().favoriteIds.includes(productId);
      },

      getFavoritesCount: () => {
        return get().favoriteProducts.length;
      },

      // Sync favorites with backend
      syncFavoritesWithBackend: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/favorites`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            const favoriteProducts = data.favorites || [];
            const favoriteIds = favoriteProducts.map((p: any) => p.id);
            
            set({ favoriteProducts, favoriteIds });
          }
        } catch (error) {
          console.error('Failed to sync favorites with backend:', error);
        }
      },

      // Fetch favorites from backend (for initial load)
      fetchFavoritesFromBackend: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/favorites`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            const favoriteProducts = data.favorites || [];
            const favoriteIds = favoriteProducts.map((p: any) => p.id);
            
            set({ favoriteProducts, favoriteIds });
          }
        } catch (error) {
          console.error('Failed to fetch favorites from backend:', error);
        }
      },
    }),
    {
      name: 'foodee-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        favoriteProducts: state.favoriteProducts,
        favoriteIds: state.favoriteIds,
      }),
    }
  )
);

export default useStore;
