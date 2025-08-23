# Database Management

Tất cả các chức năng liên quan đến database đã được gộp vào một file duy nhất: `src/database.ts`

## 📋 Các lệnh có sẵn

### Reset + Seed Database
```bash
npm run db:reset
# hoặc
tsx src/database.ts
```
- **Chức năng**: Xóa toàn bộ data và tạo lại từ đầu
- **Sử dụng khi**: Development, testing, hoặc cần reset hoàn toàn

### Seed Only (không xóa data cũ)
```bash
npm run db:seed
# hoặc
tsx src/database.ts seed
```
- **Chức năng**: Chỉ thêm data mẫu, không xóa data cũ
- **Sử dụng khi**: Cần thêm data mẫu mà không muốn mất data hiện tại

## 🗂️ Data mẫu bao gồm

### Users
- **Buyer**: buyer@foodee.com / password123
- **Seller**: seller@foodee.com / password123  
- **Buyer 2**: cuong@foodee.com / password123
- **Seller 2**: dung@foodee.com / password123

### Categories
- Bánh mì
- Đồ uống  
- Bánh ngọt
- Món chính
- Snack

### Products
- 20+ sản phẩm đa dạng từ 2 seller
- Có giá, stock, discount ngẫu nhiên

### Reviews
- 3 reviews mẫu với rating và comment

## 🏗️ Cấu trúc File

File `src/database.ts` chứa:

### Class DatabaseManager
- `initialize()` - Khởi tạo NestJS context
- `resetDatabase()` - Xóa toàn bộ data
- `seedCategories()` - Tạo categories
- `seedUsers()` - Tạo users + buyers/sellers + seller stats
- `seedProducts()` - Tạo products
- `seedReviews()` - Tạo reviews mẫu
- `updateStatistics()` - Cập nhật thống kê
- `printSummary()` - In tổng kết

### Export Functions
- `resetAndSeedDatabase()` - Reset + seed
- `seedDatabase()` - Chỉ seed

### Master Data Arrays
```typescript
const CATEGORIES = [...]  // Danh mục sản phẩm
const USERS = [...]       // User data
const PRODUCTS = [...]    // Product data  
const SAMPLE_REVIEWS = [...] // Review mẫu
```

## ⚡ Cách sử dụng

### 1. Development - Reset toàn bộ
```bash
npm run db:reset
```

### 2. Thêm data mẫu cho demo
```bash
npm run db:seed  
```

### 3. Trong code (programmatic)
```typescript
import { resetAndSeedDatabase, seedDatabase } from './database';

// Reset + seed
await resetAndSeedDatabase();

// Chỉ seed
await seedDatabase();
```

## 🎯 Lợi ích của cách tổ chức mới

1. **Đơn giản**: Chỉ 1 file thay vì nhiều file rải rác
2. **Linh hoạt**: Có thể reset hoặc chỉ seed
3. **Tái sử dụng**: Có thể import functions vào code khác
4. **Dễ maintain**: Tất cả data ở một chỗ
5. **TypeScript**: Full type safety

## 🔧 Customization

Để thêm data mẫu:

1. **Thêm categories**: Sửa array `CATEGORIES`
2. **Thêm users**: Sửa array `USERS` 
3. **Thêm products**: Sửa array `PRODUCTS`
4. **Thêm reviews**: Sửa array `SAMPLE_REVIEWS`

Sau đó chạy `npm run db:reset` để áp dụng.
