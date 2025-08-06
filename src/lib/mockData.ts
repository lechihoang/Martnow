import { User, Seller, Order, Product, Stats, Buyer, Category, OrderItem, Address } from '@/types/entities';

// Mock data cho development
export const mockUser: User = {
  id: 1,
  name: 'Nguyễn Văn A',
  username: 'nguyenvana',
  email: 'nguyenvana@example.com',
  role: 'seller',
  password: '', // Không hiển thị password
  avatar: '/default-avatar.jpg'
};

export const mockBuyer: Buyer = {
  id: 1,
  userId: 1,
  user: mockUser
};

export const mockCategory: Category = {
  id: 1,
  name: 'Bánh mì',
  description: 'Các loại bánh mì',
  products: []
};

export const mockSeller: Seller = {
  id: 1,
  userId: 1,
  user: mockUser,
  shopName: 'Quán Bánh Mì Ngon',
  shopAddress: '123 Đường ABC, Quận 1, TP.HCM',
  shopPhone: '0901234567',
  description: 'Chuyên bán bánh mì thơm ngon, giá cả phải chăng',
  products: []
};

export const mockProduct: Product = {
  id: 1,
  sellerId: 1,
  seller: mockSeller,
  categoryId: 1,
  category: mockCategory,
  name: 'Bánh mì thịt nướng',
  description: 'Bánh mì thịt nướng thơm ngon với rau sống tươi',
  price: 25000,
  imageUrl: '/images/banhmi.jpeg',
  isAvailable: true,
  stock: 50,
  discount: 10,
  images: [],
  reviews: [],
  orderItems: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockAddress: Address = {
  id: 1,
  user: mockUser,
  addressLine: '123 Đường ABC',
  city: 'TP.HCM',
  district: 'Quận 1',
  ward: 'Phường Bến Nghé',
  phone: '0901234567',
  isDefault: true
};

export const mockOrderItem: OrderItem = {
  id: 1,
  order: {} as Order, // Sẽ được gán sau
  product: mockProduct,
  quantity: 3,
  price: 25000
};

export const mockOrder: Order = {
  id: 1,
  buyer: mockBuyer,
  address: mockAddress,
  totalPrice: 75000,
  status: 'delivered',
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  items: [mockOrderItem]
};

// Gán order vào orderItem
mockOrderItem.order = mockOrder;

export const mockStats: Stats = {
  totalOrders: 156,
  totalRevenue: 3500000,
  totalProducts: 5,
  pendingOrders: 8
};

export const mockProducts: Product[] = [
  mockProduct,
  {
    id: 2,
    sellerId: 1,
    seller: mockSeller,
    categoryId: 1,
    category: mockCategory,
    name: 'Bánh mì pate',
    description: 'Bánh mì pate truyền thống',
    price: 20000,
    imageUrl: '/images/banhmi.jpeg',
    isAvailable: true,
    stock: 30,
    images: [],
    reviews: [],
    orderItems: [],
    createdAt: new Date(),
    updatedAt: new Date()
    // Không có discount - sẽ là undefined
  }
];

export const mockOrders: Order[] = [mockOrder];
