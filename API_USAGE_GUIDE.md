# Hướng dẫn sử dụng API từ api.ts

## 📋 Tổng quan

File `api.ts` chứa tất cả các function để gọi API backend. Được tổ chức thành các module:

- `userApi` - Quản lý thông tin user
- `buyerApi` - Quản lý thông tin buyer
- `sellerApi` - Quản lý thông tin seller  
- `authApi` - Authentication (đăng nhập/đăng ký)
- `productApi` - Quản lý sản phẩm
- `orderApi` - Quản lý đơn hàng
- `uploadApi` - Upload file

## 🔐 Authentication API

### 1. Đăng nhập
```typescript
import { authApi } from '../lib/api';

const handleLogin = async () => {
  try {
    const response = await authApi.login('email@example.com', 'password');
    console.log('User:', response.user);
    // Lưu thông tin user hoặc redirect
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 2. Đăng ký
```typescript
import { authApi } from '../lib/api';
import { CreateUserDto } from '../types/dtos';

const handleRegister = async () => {
  const userData: CreateUserDto = {
    email: 'newuser@example.com',
    password: 'password123',
    name: 'Tên User',
    username: 'username',
    phone: '0123456789'
  };

  try {
    const user = await authApi.register(userData);
    console.log('Registered user:', user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### 3. Đăng xuất
```typescript
const handleLogout = async () => {
  try {
    const response = await authApi.logout();
    console.log(response.message);
    // Clear user state, redirect to login
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### 4. Lấy thông tin profile hiện tại
```typescript
const getCurrentUser = async () => {
  try {
    const user = await authApi.getProfile();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};
```

## 👤 User API

### 1. Lấy thông tin user bất kỳ
```typescript
import { userApi } from '../lib/api';

const getUserInfo = async (userId: number) => {
  try {
    const user = await userApi.getProfile(userId);
    console.log('User info:', user);
    // user sẽ chứa thông tin buyer/seller nếu có
  } catch (error) {
    console.error('Failed to get user:', error);
  }
};
```

### 2. Lấy reviews của user
```typescript
const getUserReviews = async (userId: number) => {
  try {
    const reviews = await userApi.getUserReviews(userId);
    console.log('User reviews:', reviews.reviews);
    console.log('Average rating:', reviews.averageRating);
  } catch (error) {
    console.error('Failed to get reviews:', error);
  }
};
```

### 3. Cập nhật thông tin user
```typescript
import { UpdateUserDto } from '../types/dtos';

const updateUser = async (userId: number) => {
  const updateData: UpdateUserDto = {
    name: 'Tên mới',
    phone: '0987654321',
    avatar: 'avatar-url.jpg'
  };

  try {
    const updatedUser = await userApi.updateUser(userId, updateData);
    console.log('Updated user:', updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};
```

## 🛒 Buyer API

### 1. Trở thành buyer
```typescript
import { buyerApi } from '../lib/api';
import { CreateBuyerDto } from '../types/dtos';

const becomeBuyer = async (userId: number) => {
  const buyerData: CreateBuyerDto = {
    userId: userId,
    shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
    billingAddress: '123 Đường ABC, Quận 1, TP.HCM'
  };

  try {
    const buyer = await buyerApi.createBuyer(buyerData);
    console.log('Become buyer successful:', buyer);
  } catch (error) {
    console.error('Failed to become buyer:', error);
  }
};
```

### 2. Lấy đơn hàng của buyer
```typescript
const getBuyerOrders = async (buyerId: number) => {
  try {
    const orders = await buyerApi.getBuyerOrders(buyerId);
    console.log('Buyer orders:', orders.orders);
    console.log('Total orders:', orders.totalOrders);
  } catch (error) {
    console.error('Failed to get buyer orders:', error);
  }
};
```

## 🏪 Seller API

### 1. Trở thành seller
```typescript
import { sellerApi } from '../lib/api';
import { CreateSellerDto } from '../types/dtos';

const becomeSeller = async (userId: number) => {
  const sellerData: CreateSellerDto = {
    userId: userId,
    shopName: 'Cửa hàng của tôi',
    description: 'Chào mừng đến với cửa hàng!',
    shopAddress: '456 Đường DEF, Quận 2, TP.HCM',
    shopPhone: '0123456789'
  };

  try {
    const seller = await sellerApi.createSeller(sellerData);
    console.log('Become seller successful:', seller);
  } catch (error) {
    console.error('Failed to become seller:', error);
  }
};
```

### 2. Cập nhật thông tin seller
```typescript
import { UpdateSellerDto } from '../types/dtos';

const updateSeller = async (sellerId: number) => {
  const updateData: UpdateSellerDto = {
    shopName: 'Tên shop mới',
    description: 'Mô tả mới',
    shopAddress: 'Địa chỉ mới',
    shopPhone: '0987654321'
  };

  try {
    const updatedSeller = await sellerApi.updateSeller(sellerId, updateData);
    console.log('Updated seller:', updatedSeller);
  } catch (error) {
    console.error('Failed to update seller:', error);
  }
};
```

### 3. Lấy đơn hàng của seller
```typescript
const getSellerOrders = async (sellerId: number) => {
  try {
    const orders = await sellerApi.getSellerOrders(sellerId);
    console.log('Seller orders:', orders.orders);
    console.log('Total revenue:', orders.totalRevenue);
  } catch (error) {
    console.error('Failed to get seller orders:', error);
  }
};
```

## 📦 Product API

### 1. Lấy tất cả sản phẩm
```typescript
import { productApi } from '../lib/api';

const getAllProducts = async () => {
  try {
    const products = await productApi.getProducts();
    console.log('All products:', products);
  } catch (error) {
    console.error('Failed to get products:', error);
  }
};
```

### 2. Lấy sản phẩm theo ID
```typescript
const getProductById = async (productId: number) => {
  try {
    const product = await productApi.getProduct(productId);
    console.log('Product:', product);
  } catch (error) {
    console.error('Failed to get product:', error);
  }
};
```

### 3. Lấy sản phẩm của seller
```typescript
const getSellerProducts = async (sellerId: number) => {
  try {
    const products = await productApi.getProductsBySeller(sellerId);
    console.log('Seller products:', products);
  } catch (error) {
    console.error('Failed to get seller products:', error);
  }
};
```

### 4. Tạo sản phẩm mới
```typescript
import { CreateProductDto } from '../types/dtos';

const createProduct = async () => {
  const productData: CreateProductDto = {
    name: 'Tên sản phẩm',
    description: 'Mô tả sản phẩm',
    price: 100000,
    stock: 50,
    categoryId: 1,
    sellerId: 1,
    // images: ['image1.jpg', 'image2.jpg'] // optional
  };

  try {
    const product = await productApi.createProduct(productData);
    console.log('Created product:', product);
  } catch (error) {
    console.error('Failed to create product:', error);
  }
};
```

### 5. Cập nhật sản phẩm
```typescript
import { UpdateProductDto } from '../types/dtos';

const updateProduct = async (productId: number) => {
  const updateData: UpdateProductDto = {
    name: 'Tên mới',
    price: 120000,
    stock: 30
  };

  try {
    const updatedProduct = await productApi.updateProduct(productId, updateData);
    console.log('Updated product:', updatedProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
  }
};
```

### 6. Xóa sản phẩm
```typescript
const deleteProduct = async (productId: number) => {
  try {
    await productApi.deleteProduct(productId);
    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Failed to delete product:', error);
  }
};
```

## 📄 Order API

### 1. Tạo đơn hàng
```typescript
import { orderApi } from '../lib/api';
import { CreateOrderDto } from '../types/dtos';

const createOrder = async () => {
  const orderData: CreateOrderDto = {
    buyerId: 1,
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 100000
      },
      {
        productId: 2,
        quantity: 1,
        price: 50000
      }
    ],
    totalPrice: 250000,
    shippingAddress: '123 Đường ABC, Quận 1, TP.HCM'
  };

  try {
    const order = await orderApi.createOrder(orderData);
    console.log('Created order:', order);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
};
```

## 📁 Upload API

### 1. Upload file
```typescript
import { uploadApi } from '../lib/api';

const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadApi.uploadFile(file);
    console.log('Upload successful:', result.url);
    return result.url; // Có thể dùng URL này để lưu vào database
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Sử dụng trong React component
const FileUploadComponent = () => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const uploadedUrl = await handleFileUpload(file);
      // Sử dụng uploadedUrl...
    }
  };

  return <input type="file" onChange={handleFileChange} />;
};
```

## 🎯 Sử dụng trong React Hooks

### Custom Hook cho User Profile
```typescript
import { useState, useEffect } from 'react';
import { userApi } from '../lib/api';
import { UserResponseDto } from '../types/dtos';

const useUserProfile = (userId: number) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userApi.getProfile(userId);
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};
```

### Custom Hook cho Products
```typescript
import { useState, useEffect } from 'react';
import { productApi } from '../lib/api';
import { ProductResponseDto } from '../types/dtos';

const useProducts = () => {
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productApi.getProducts();
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};
```

## 🔧 Error Handling

### Pattern chung cho error handling
```typescript
const apiCall = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await someApi.someMethod();
    
    // Handle success
    console.log('Success:', result);
    
  } catch (error) {
    // Handle error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setError(errorMessage);
    console.error('API Error:', errorMessage);
    
    // Có thể thêm toast notification hoặc alert
    // toast.error(errorMessage);
    
  } finally {
    setLoading(false);
  }
};
```

## 🌟 Best Practices

1. **Luôn dùng try-catch** khi gọi API
2. **Kiểm tra loading state** để hiển thị loading indicator
3. **Handle errors** một cách graceful với user-friendly messages
4. **Type safety** - sử dụng đúng DTOs từ `../types/dtos`
5. **Credentials include** - tất cả API đều dùng `credentials: 'include'` cho authentication
6. **Reusable hooks** - tạo custom hooks cho các API calls thường dùng

## 📝 Lưu ý quan trọng

- Tất cả API đều sử dụng **httpOnly cookies** cho authentication
- Backend chạy trên port **3001** (có thể thay đổi trong `.env`)
- DTOs được import từ `../types/dtos` để đảm bảo type safety
- API base URL được cấu hình trong `process.env.NEXT_PUBLIC_API_URL`
