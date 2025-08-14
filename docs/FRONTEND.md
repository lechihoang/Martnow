# Foodee Frontend

Frontend của ứng dụng Foodee được xây dựng với **Next.js 14**, **TypeScript**, và **Tailwind CSS**.

## 🏗 Kiến trúc

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Auth layout group
│   │   ├── login/         # Login page
│   │   └── register/      # Register page
│   ├── add/               # Add product page (seller)
│   ├── shop/              # Product listing
│   ├── cart/              # Shopping cart
│   ├── orders/            # Order history
│   ├── payment/           # Payment pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── product/          # Product-specific components
├── lib/                  # Utilities & configurations
│   ├── api.ts           # API client
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
│   ├── entities.ts      # Domain entities
│   └── api.ts          # API response types
├── hooks/               # Custom React hooks
├── store/               # State management (Zustand)
└── styles/              # Global styles
```

## 🚀 Cài đặt

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Tạo file môi trường:
```bash
cp .env.example .env.local
```

### 3. Cấu hình .env.local:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# VNPay (for payment redirect)
NEXT_PUBLIC_VNPAY_RETURN_URL=http://localhost:3000/payment/result
```

### 4. Chạy development server:
```bash
npm run dev
```

### 5. Build cho production:
```bash
npm run build
npm start
```

## 📱 Pages & Routes

### Public Routes (Không cần đăng nhập):

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.tsx` | Trang chủ |
| `/shop` | `shop/page.tsx` | Danh sách sản phẩm |
| `/shop/[id]` | `shop/[id]/page.tsx` | Chi tiết sản phẩm |
| `/login` | `(auth)/login/page.tsx` | Đăng nhập |
| `/register` | `(auth)/register/page.tsx` | Đăng ký |

### Protected Routes (Cần đăng nhập):

| Route | Component | Description | Role |
|-------|-----------|-------------|------|
| `/cart` | `cart/page.tsx` | Giỏ hàng | Buyer |
| `/orders` | `orders/page.tsx` | Đơn hàng đã mua (chỉ buyer) | Buyer |
| `/profile/[id]/sales-history` | `profile/[id]/sales-history/page.tsx` | Lịch sử bán hàng (chỉ seller) | Seller |
| `/manage-orders` | `manage-orders/page.tsx` | Quản lý đơn hàng (seller) | Seller |
| `/add` | `add/page.tsx` | Thêm sản phẩm | Seller |
| `/profile` | `profile/page.tsx` | Thông tin cá nhân | All |

### Payment Routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/payment/[orderId]` | `payment/[orderId]/page.tsx` | Thanh toán |
| `/payment/result` | `payment/result/page.tsx` | Kết quả thanh toán |

## 🧩 Components

### Layout Components (`components/layout/`):

#### Header:
```tsx
// components/layout/Header.tsx
export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <Navigation />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
```

#### Navigation:
- Logo và branding
- Menu chính (Home, Shop, About)
- User menu (Login/Profile)
- Cart icon với số lượng

### Form Components (`components/forms/`):

#### AddProductForm:
```tsx
// components/AddOrderForm.tsx
export default function AddProductForm() {
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: undefined,
  });
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    
    // Create preview
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Convert images to base64
  const convertImagesToBase64 = async () => {
    const base64Promises = selectedImages.map(async (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            imageData: e.target?.result as string,
            mimeType: file.type,
            originalName: file.name,
            fileSize: file.size
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    return Promise.all(base64Promises);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const imageBase64Array = await convertImagesToBase64();
    
    const response = await fetch('http://localhost:3001/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...form,
        images: imageBase64Array,
      }),
    });
    
    if (response.ok) {
      toast.success('Đã thêm sản phẩm thành công!');
      // Reset form
    }
  };
}
```

### Product Components (`components/product/`):

#### ProductCard:
```tsx
// components/product/ProductCard.tsx
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img 
          src={product.primaryImageUrl || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
            -{product.discount}%
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            {formatPrice(product.price)} VNĐ
          </span>
          
          <div className="flex items-center">
            <StarRating rating={product.averageRating} />
            <span className="text-sm text-gray-500 ml-1">
              ({product.totalReviews})
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => addToCart(product)}
          className="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
```

### UI Components (`components/ui/`):

#### Loading:
```tsx
// components/ui/Loading.tsx
export default function Loading() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

#### Toast Notifications:
```tsx
// Using react-hot-toast
import toast, { Toaster } from 'react-hot-toast';

// In layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

## 🔗 API Integration

### API Client (`lib/api.ts`):

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies for JWT
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const productApi = {
  // Get all products
  getProducts: (params?: any) => 
    api.get('/products', { params }),
    
  // Get single product
  getProduct: (id: number) => 
    api.get(`/products/${id}`),
    
  // Create product (seller only)
  createProduct: (data: any) => 
    api.post('/products', data),
    
  // Get categories
  getCategories: () => 
    api.get('/products/categories'),
};

export const authApi = {
  login: (credentials: LoginCredentials) => 
    api.post('/auth/login', credentials),
    
  register: (userData: RegisterData) => 
    api.post('/auth/register', userData),
    
  getProfile: () => 
    api.post('/auth/profile'),
    
  logout: () => 
    api.post('/auth/logout'),
};

export const orderApi = {
  createOrder: (orderData: CreateOrderData) => 
    api.post('/orders', orderData),
    
  getOrders: () => 
    api.get('/orders'),
    
  getOrder: (id: number) => 
    api.get(`/orders/${id}`),
};

export default api;
```

### Custom Hooks (`hooks/`):

#### useAuth:
```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setUser(response.data.user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### useProducts:
```typescript
// hooks/useProducts.ts
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProducts(filters);
      setProducts(response.data);
    } catch (err) {
      setError('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}
```

## 🛒 State Management

### Cart Store (Zustand):

```typescript
// store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              imageUrl: product.primaryImageUrl,
            }]
          });
        }
        
        // Recalculate totals
        const newItems = get().items;
        set({
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        });
      },
      
      removeItem: (productId) => {
        const { items } = get();
        const newItems = items.filter(item => item.productId !== productId);
        
        set({
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const { items } = get();
        const newItems = items.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        );
        
        set({
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        });
      },
      
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

## 🎨 Styling & UI

### Tailwind CSS Configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
};
```

### Global Styles:

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md overflow-hidden;
  }
  
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

## 🔒 Authentication & Route Protection

### Protected Route Component:

```tsx
// components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'BUYER' | 'SELLER';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (!loading && user && role && user.role !== role) {
      router.push('/unauthorized');
    }
  }, [user, loading, role, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user || (role && user.role !== role)) {
    return null;
  }

  return <>{children}</>;
}
```

### Usage in Pages:

```tsx
// app/add/page.tsx - Seller only page
export default function AddProductPage() {
  return (
    <ProtectedRoute role="SELLER">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h1>
        <AddProductForm />
      </div>
    </ProtectedRoute>
  );
}
```

## 📱 Responsive Design

### Mobile-First Approach:

```tsx
// Responsive component example
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Breakpoints:
- `sm`: 640px
- `md`: 768px  
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🚀 Performance Optimization

### Image Optimization:

```tsx
// Using Next.js Image component
import Image from 'next/image';

export default function ProductImage({ src, alt }: { src: string, alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={200}
      className="object-cover"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### Code Splitting:

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const PaymentModal = dynamic(() => import('./PaymentModal'), {
  loading: () => <Loading />
});
```

### Caching:

```tsx
// SWR for data fetching with cache
import useSWR from 'swr';

export function useProducts() {
  const { data, error, mutate } = useSWR('/products', productApi.getProducts);
  
  return {
    products: data?.data || [],
    loading: !error && !data,
    error,
    mutate
  };
}
```

## 🧪 Testing

### Component Testing:

```tsx
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/product/ProductCard';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 100000,
  primaryImageUrl: '/test.jpg'
};

test('renders product card', () => {
  render(<ProductCard product={mockProduct} />);
  
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('100,000 VNĐ')).toBeInTheDocument();
});
```

### E2E Testing:

```typescript
// e2e/add-product.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('seller can add product', async ({ page }) => {
  await page.goto('/login');
  
  // Login as seller
  await page.fill('input[name="username"]', 'seller1');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to add product
  await page.goto('/add');
  
  // Fill product form
  await page.fill('input[name="name"]', 'New Product');
  await page.fill('textarea[name="description"]', 'Product description');
  await page.fill('input[name="price"]', '50000');
  
  // Upload image
  await page.setInputFiles('input[type="file"]', './test-image.jpg');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

## 📦 Build & Deployment

### Build Commands:

```bash
# Development build
npm run dev

# Production build
npm run build

# Start production server
npm start

# Export static site (if needed)
npm run export
```

### Environment Variables:

```env
# Production .env.local
NEXT_PUBLIC_API_URL=https://api.foodee.com
NEXT_PUBLIC_APP_URL=https://foodee.com
```

### Deployment Checklist:

- [ ] Set production API URL
- [ ] Configure CORS on backend
- [ ] Setup SSL certificates
- [ ] Configure CDN for static assets
- [ ] Setup monitoring and analytics
- [ ] Test all user flows

---

## 🤝 Contributing

### Code Style:
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful component names
- Add JSDoc comments for complex functions

### Component Guidelines:
- Keep components small and focused
- Use composition over inheritance
- Extract custom hooks for business logic
- Use proper TypeScript interfaces
- Handle loading and error states

### Commit Convention:
```
feat: add product search functionality
fix: resolve cart total calculation bug
docs: update API integration guide
style: format product card component
refactor: extract auth logic to custom hook
```

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourrepo/foodee/issues)
- Documentation: [Storybook](http://localhost:6006) (if available)
- Email: frontend@foodee.com
