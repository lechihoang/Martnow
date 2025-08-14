# Migration Summary: Number ID to UUID

## Thay đổi đã thực hiện

### 1. Product Controller & DTOs
- ✅ Chuyển `categoryId` từ `number` sang `string` trong:
  - `CreateProductDto`
  - `ProductResponseDto` 
  - `ProductDetailDto`
  - Query parameter trong `ProductController`

### 2. Review Controller
- ✅ Thay đổi từ `ParseIntPipe` sang `ParseUUIDPipe` cho:
  - `productId` parameter trong tất cả endpoints
  - `id` parameter cho review operations
- ✅ Cập nhật DTOs:
  - `CreateReviewDto.productId`: `number` → `string`
  - `ReviewResponseDto.id`: `number` → `string`
  - `ReviewResponseDto.productId`: `number` → `string`

### 3. Payment Service & DTOs
- ✅ Sửa `orderId` type từ `number` sang `string` trong:
  - `PaymentResponseDto.orderId`

### 4. Seller-stats Service
- ✅ Cập nhật method signatures:
  - `getSellerStats(sellerId: string)`
  - `updateSellerStats(sellerId: string)`
- ✅ Cập nhật DTO:
  - `SellerStatsDto.sellerId`: `number` → `string`

### 5. Database Seed
- ✅ Tạo file `src/seed.ts` với:
  - Sample categories với UUID
  - Sample users (buyers & sellers)
  - Sample products với relation đúng
  - Script có thể chạy độc lập hoặc import

## Cách chạy seed

```bash
npm run seed
```

hoặc

```bash
ts-node -r tsconfig-paths/register src/seed.ts
```

## Dữ liệu sample

### Categories (UUID)
- Đồ ăn nhanh
- Đồ uống  
- Món Việt
- Tráng miệng
- Món chay

### Users
- 2 buyers (buyer1, buyer2)
- 2 sellers (seller1, seller2)

### Products
- 6 sản phẩm với đầy đủ thông tin
- Bao gồm discount, stock, categories

## Lưu ý
- Tất cả ID entity chính (Category, Order, User, etc.) đã chuyển sang UUID
- Foreign keys và references đã được cập nhật tương ứng
- Validation pipes đã được thay đổi phù hợp
- Database relationships vẫn hoạt động bình thường
