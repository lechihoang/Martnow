# MartNow - Nền tảng Tạp hóa Online

MartNow là một nền tảng thương mại điện tử hiện đại cho phép người dùng mua sắm tạp hóa online với giao hàng nhanh. Dự án được xây dựng với kiến trúc fullstack, sử dụng NestJS cho backend và Next.js cho frontend.

## 🌟 Tính năng chính

### Người mua (Buyer)
- **Quản lý tài khoản**: Đăng ký, đăng nhập, quản lý thông tin cá nhân
- **Xác thực đa dạng**: Email/Password, Google OAuth
- **Duyệt sản phẩm**: Tìm kiếm, lọc theo danh mục, giá, đánh giá
- **Giỏ hàng**: Thêm/xóa sản phẩm, cập nhật số lượng
- **Thanh toán**: Tích hợp VNPay cho thanh toán online an toàn
- **Đánh giá sản phẩm**: Viết review, đánh giá sao, đánh dấu hữu ích
- **Yêu thích**: Lưu sản phẩm yêu thích để mua sau
- **Lịch sử đơn hàng**: Theo dõi đơn hàng đã mua
- **Blog**: Đọc và tương tác với bài viết cộng đồng

### Người bán (Seller)
- **Quản lý sản phẩm**: Thêm, sửa, xóa sản phẩm
- **Quản lý đơn hàng**: Xem đơn hàng từ khách hàng
- **Thống kê bán hàng**: Dashboard với doanh thu, đơn hàng, sản phẩm bán chạy
- **Quản lý kho**: Theo dõi tồn kho sản phẩm
- **Hồ sơ cửa hàng**: Tùy chỉnh thông tin cửa hàng

### Blog & Cộng đồng
- **Viết blog**: Tạo và chia sẻ bài viết với rich text editor
- **Bình luận**: Thảo luận trên bài viết
- **Vote**: Upvote/downvote bài viết
- **Quản lý nội dung**: Chỉnh sửa, xóa bài viết của mình

## 🏗️ Kiến trúc hệ thống

```
martnow/
├── backend/          # NestJS API Server
│   ├── src/
│   │   ├── account/      # User, Buyer, Seller management
│   │   ├── auth/         # Authentication & Authorization
│   │   ├── product/      # Product management
│   │   ├── order/        # Order processing
│   │   ├── payment/      # VNPay integration
│   │   ├── review/       # Product reviews
│   │   ├── favorite/     # Favorite products
│   │   ├── blog/         # Blog system
│   │   ├── media/        # File upload (Cloudinary)
│   │   └── seller-stats/ # Seller analytics
│   └── ...
│
└── frontend/         # Next.js 15 App
    ├── src/
    │   ├── app/          # App Router pages
    │   ├── components/   # React components
    │   ├── contexts/     # Auth context
    │   ├── stores/       # Zustand state management
    │   ├── lib/          # API client & utilities
    │   └── types/        # TypeScript types
    └── ...
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 11
- **Database**: PostgreSQL với TypeORM
- **Authentication**: Supabase Auth (JWT)
- **Payment**: VNPay
- **File Storage**: Cloudinary
- **Validation**: class-validator, class-transformer
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Rich Text**: TipTap
- **Authentication**: Supabase Client
- **Icons**: Lucide React, React Icons

### DevOps & Tools
- **Language**: TypeScript
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js 20+
- PostgreSQL 14+
- npm hoặc yarn

### Backend Setup

```bash
cd backend

# Cài đặt dependencies
npm install

# Cấu hình environment variables
cp .env.example .env
# Chỉnh sửa .env với thông tin database, Supabase, VNPay, Cloudinary

# Chạy migrations (TypeORM sync)
npm run start:dev

# Seed dữ liệu mẫu (optional)
npm run seed

# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Frontend Setup

```bash
cd frontend

# Cài đặt dependencies
npm install

# Cấu hình environment variables
cp .env.example .env
# Chỉnh sửa .env với API URL và Supabase credentials

# Development
npm run dev

# Production
npm run build
npm start
```

## 📝 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/martnow

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# VNPay
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECURE_SECRET=your_vnpay_secret
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay-return

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 API Documentation

API endpoints được tổ chức theo modules:

- **Auth**: `/auth/*` - Authentication & user management
- **Products**: `/product/*` - Product CRUD & search
- **Orders**: `/order/*` - Order processing & checkout
- **Payment**: `/payment/*` - VNPay integration
- **Reviews**: `/reviews/*` - Product reviews
- **Favorites**: `/favorites/*` - Favorite products
- **Blogs**: `/blogs/*` - Blog posts & comments
- **Sellers**: `/sellers/*` - Seller profile & stats
- **Media**: `/media/*` - File uploads

Chi tiết API documentation xem trong [backend/README.md](./backend/README.md)

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# Run tests (khi có)
npm test
```

## 📦 Database Schema

Các entities chính:
- **User**: Thông tin người dùng cơ bản
- **Buyer**: Thông tin người mua
- **Seller**: Thông tin người bán
- **Product**: Sản phẩm
- **Category**: Danh mục sản phẩm
- **Order**: Đơn hàng
- **OrderItem**: Chi tiết đơn hàng
- **Review**: Đánh giá sản phẩm
- **Favorite**: Sản phẩm yêu thích
- **Blog**: Bài viết blog
- **BlogComment**: Bình luận blog
- **BlogVote**: Vote bài viết
- **SellerStats**: Thống kê người bán

## 🔐 Authentication Flow

1. User đăng ký/đăng nhập qua Supabase Auth
2. Backend tạo profile trong database (User + Buyer/Seller)
3. Frontend lưu session và access token
4. Mọi API request gửi kèm Bearer token
5. Backend verify token qua Supabase và kiểm tra quyền

## 💳 Payment Flow

1. User checkout giỏ hàng
2. Backend tạo order với status PENDING
3. Backend tạo VNPay payment URL
4. User thanh toán trên VNPay
5. VNPay redirect về callback URL
6. Backend verify payment và cập nhật order status thành PAID
7. Trừ stock sản phẩm

## 🎨 UI/UX Features

- **Responsive Design**: Tối ưu cho mobile, tablet, desktop
- **Dark Mode Ready**: Chuẩn bị sẵn cho dark mode
- **Loading States**: Skeleton loaders và spinners
- **Error Handling**: Toast notifications cho user feedback
- **Image Optimization**: Next.js Image component
- **SEO Friendly**: Metadata và structured data

## 🔄 State Management

- **Global State**: Zustand (cart, favorites)
- **Server State**: React Query patterns (trong API calls)
- **Auth State**: React Context
- **Form State**: React Hook Form

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚧 Roadmap

- [ ] Real-time notifications với WebSocket
- [ ] Chat giữa buyer và seller
- [ ] Wishlist sharing
- [ ] Product recommendations
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA support

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed by MartNow Team

## 📞 Support

For support, email support@martnow.com or join our Slack channel.
