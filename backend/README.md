# Foodee Backend API

Backend API cho ứng dụng Foodee được xây dựng với **NestJS**, **TypeORM**, và **PostgreSQL**.

## 🏗 Kiến trúc

```
src/
├── auth/                   # Authentication & Authorization
│   ├── dto/               # Data Transfer Objects
│   ├── guards/            # JWT & Role guards
│   ├── strategies/        # Passport strategies
│   └── auth.service.ts    # Auth logic
├── user/                  # User management
│   ├── entities/          # User, Buyer, Seller entities
│   ├── dto/               # User DTOs
│   └── user.service.ts
├── product/               # Product management
│   ├── entities/          # Product, ProductImage, Category
│   ├── dto/               # Product DTOs
│   └── product.service.ts
├── order/                 # Order processing
├── payment/               # VNPay integration
├── review/                # Product reviews
├── favorite/              # User favorites
├── address/               # Address management
└── common/                # Shared utilities
```

## 🚀 Cài đặt

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Tạo file môi trường:
```bash
cp .env.example .env
```

### 3. Cấu hình .env:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=foodee_db

# JWT
JWT_SECRET=your-super-secret-jwt-key

# VNPay
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/result

# App
PORT=3001
NODE_ENV=development
```

### 4. Chạy database migration:
```bash
npm run typeorm:run
```

### 5. Seed dữ liệu mẫu (optional):
```bash
npm run seed
```

## 🏃‍♂️ Chạy ứng dụng

### Development:
```bash
npm run start:dev
```

### Production:
```bash
npm run build
npm run start:prod
```

### Debug mode:
```bash
npm run start:debug
```

## 📡 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/auth/login` | Đăng nhập | ❌ |
| POST | `/auth/logout` | Đăng xuất | ✅ |
| POST | `/auth/profile` | Lấy thông tin user | ✅ |

#### Register Request:
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "BUYER" // or "SELLER"
}
```

#### Login Request:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

### Products (`/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Lấy danh sách sản phẩm | ❌ |
| GET | `/products/categories` | Lấy danh mục sản phẩm | ❌ |
| GET | `/products/:id` | Lấy chi tiết sản phẩm | ❌ |
| POST | `/products` | Tạo sản phẩm mới | ✅ (Seller) |
| PATCH | `/products/:id` | Cập nhật sản phẩm | ✅ (Seller) |
| DELETE | `/products/:id` | Xóa sản phẩm | ✅ (Seller) |

#### Create Product Request:
```json
{
  "name": "Cơm chiên dương châu",
  "description": "Cơm chiên thơm ngon với tôm, xúc xích",
  "price": 45000,
  "stock": 100,
  "categoryId": 1
}
```

### Orders (`/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | Lấy danh sách đơn hàng | ✅ |
| GET | `/orders/:id` | Chi tiết đơn hàng | ✅ |
| POST | `/orders` | Tạo đơn hàng mới | ✅ (Buyer) |
| GET | `/orders/pending` | Đơn hàng đang chờ | ✅ (Seller) |

#### Create Order Request:
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 45000
    }
  ],
  "totalPrice": 90000,
  "addressId": 1,
  "note": "Giao hàng nhanh"
}
```

### Payment (`/payment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payment/create/:orderId` | Tạo link thanh toán VNPay | ✅ |
| GET | `/payment/vnpay-return` | Xử lý callback VNPay | ❌ |
| POST | `/payment/vnpay-ipn` | Webhook VNPay IPN | ❌ |

### Reviews (`/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews/product/:productId` | Đánh giá của sản phẩm | ❌ |
| POST | `/reviews` | Tạo đánh giá mới | ✅ (Buyer) |
| PATCH | `/reviews/:id` | Cập nhật đánh giá | ✅ |
| DELETE | `/reviews/:id` | Xóa đánh giá | ✅ |

## 🔐 Authentication & Authorization

### JWT Token:
- Access token có thời hạn 1 giờ
- Refresh token có thời hạn 7 ngày
- Token được gửi qua Cookie (HTTP-only)

### Role-based Access:
- **BUYER**: Khách hàng có thể đặt hàng, đánh giá
- **SELLER**: Người bán có thể quản lý sản phẩm, đơn hàng

### Guard Usage:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@Post()
createProduct(@Body() dto: CreateProductDto) {
  // Only sellers can access
}
```

## 🗄 Database Schema

### Core Entities:

#### User:
- `id` - Primary key
- `name` - Tên người dùng
- `username` - Tên đăng nhập (unique)
- `email` - Email (unique)
- `password` - Mật khẩu đã hash
- `role` - BUYER hoặc SELLER
- `avatar` - URL avatar

#### Product:
- `id` - Primary key
- `name` - Tên sản phẩm
- `description` - Mô tả
- `price` - Giá
- `stock` - Số lượng tồn kho
- `sellerId` - ID người bán
- `categoryId` - ID danh mục
- `isAvailable` - Còn bán không
- `averageRating` - Điểm đánh giá trung bình
- `totalSold` - Đã bán


#### Order:
- `id` - Primary key
- `buyerId` - ID khách hàng
- `totalPrice` - Tổng tiền
- `status` - Trạng thái đơn hàng
- `note` - Ghi chú

### Relationships:
```
User 1:1 Buyer
User 1:1 Seller
Seller 1:n Products
Product 1:n Reviews
Buyer 1:n Orders
Order 1:n OrderItems
```

## 🎯 Business Logic

### Product Management:
- Sellers có thể tạo/sửa/xóa sản phẩm của mình
- Tự động tính toán điểm đánh giá trung bình

### Order Processing:
1. Buyer tạo đơn hàng
2. Kiểm tra tồn kho
3. Tạo payment link (VNPay)
4. Callback xử lý kết quả thanh toán
5. Cập nhật trạng thái đơn hàng


## 🧪 Testing

### Unit Tests:
```bash
npm run test
```

### E2E Tests:
```bash
npm run test:e2e
```

### Test Coverage:
```bash
npm run test:cov
```

### Testing Structure:
```
src/
├── auth/
│   ├── auth.service.spec.ts
│   └── auth.controller.spec.ts
├── product/
│   ├── product.service.spec.ts
│   └── product.controller.spec.ts
└── test/
    ├── app.e2e-spec.ts
    └── fixtures/
```

## 🔧 Configuration

### TypeORM Configuration:
```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
    }),
  ],
})
```

### JWT Configuration:
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '1h' },
})
```

## 📊 Monitoring & Logging

### Request Logging:
```typescript
// All requests are logged with timestamp
[Nest] INFO [RouterExplorer] Mapped {/products, GET} route
```

### Error Handling:
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Global error handling
  }
}
```

## 🚀 Performance Optimization

### Database Optimizations:
- Indexes trên các trường thường query
- Lazy loading cho relations
- Query optimization với QueryBuilder

### Caching (Future):
```typescript
@CacheKey('products')
@CacheTTL(300)
@Get()
findAll() {
  return this.productService.findAll();
}
```

## 📝 API Response Format

### Success Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Product name"
  }
}
```

### Error Response:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🔒 Security

### Security Measures:
- JWT Authentication
- Password hashing với bcrypt
- Rate limiting
- CORS configuration
- Input validation với class-validator
- SQL injection protection (TypeORM)

### Environment Variables:
```bash
# Bảo mật secrets
JWT_SECRET=complex-random-string
DB_PASSWORD=strong-password
VNPAY_SECRET_KEY=vnpay-secret

# Không commit .env file
echo ".env" >> .gitignore
```

## 📈 Scaling Considerations

### Horizontal Scaling:
- Stateless API design
- Database connection pooling
- Load balancer ready

### Database Scaling:
- Read replicas
- Connection pooling
- Query optimization

---

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Viết tests cho code mới
4. Đảm bảo tất cả tests pass
5. Tạo Pull Request

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourrepo/foodee/issues)
- Documentation: [API Docs](http://localhost:3001/api)
- Email: dev@foodee.com
