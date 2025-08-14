# Order Status Management

## 📋 Tổng quan

Hệ thống quản lý trạng thái đơn hàng được thiết kế để hiển thị thông tin phù hợp với từng vai trò người dùng.

## 🔄 Logic trạng thái

### **Buyer (Người mua)**
- **Chỉ hiển thị**: Đơn hàng đã thanh toán (`đã thanh toán`)
- **Endpoint**: `GET /orders/my-orders`
- **Mục đích**: Buyer chỉ cần biết những đơn hàng họ đã mua thành công

### **Seller (Người bán)**  
- **Hiển thị**: 
  - `đang bán` - Đơn hàng mới được đặt, đang chờ xử lý
  - `đã bán hết` - Đơn hàng đã hoàn thành
- **Endpoint**: `GET /sellers/{sellerId}/orders`
- **Mục đích**: Seller cần quản lý và theo dõi các đơn hàng từ khách hàng

### **Trạng thái nội bộ (Không hiển thị cho user)**
- `chờ thanh toán` - Đơn hàng vừa được tạo, chưa thanh toán
- `cancelled` - Đơn hàng bị hủy

## 🛠 API Endpoints

### Buyer APIs
```http
GET /orders/my-orders
Authorization: Bearer {token}
Roles: BUYER
```

### Seller APIs  
```http
GET /sellers/{sellerId}/orders
Authorization: Bearer {token}
```

### Admin APIs
```http
GET /orders/pending        # Đơn hàng chờ thanh toán
GET /orders/statistics     # Thống kê đơn hàng
GET /orders/timeout        # Đơn hàng timeout
```

## 📊 Database Schema

```sql
-- Order table
status VARCHAR(50) -- Lưu trữ các giá trị:
-- 'đã thanh toán', 'đang bán', 'đã bán hết', 'chờ thanh toán', 'cancelled'
```

## 🚀 Quy trình hoạt động

1. **Tạo đơn hàng**: 
   - Trạng thái ban đầu: `chờ thanh toán`
   - Chỉ admin/system có thể thấy

2. **Thanh toán thành công**:
   - Trạng thái chuyển thành: `đã thanh toán` 
   - Buyer có thể thấy trong "Đơn hàng của tôi"
   - Seller thấy trạng thái `đang bán`

3. **Hoàn thành đơn hàng**:
   - Seller có thể cập nhật: `đang bán` → `đã bán hết`

## ⚡ Performance Notes

- Sử dụng index trên column `status` và `buyerId`
- Query optimization với relations được load một cách có chọn lọc
- Pagination được áp dụng cho các danh sách đơn hàng lớn

## 🔒 Security

- Role-based access control (RBAC)
- Buyer chỉ có thể xem đơn hàng của chính mình
- Seller chỉ có thể xem đơn hàng liên quan đến sản phẩm của mình
- Admin có quyền xem tất cả
