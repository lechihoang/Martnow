# Cloudinary Setup Guide

## 📋 Bước 1: Đăng ký tài khoản

1. **Truy cập Cloudinary**: https://cloudinary.com/
2. **Đăng ký**: Click "Sign up for Free"
3. **Điền form**:
   - First name, Last name
   - Email address
   - Company (có thể điền tên project: "Foodee")
   - Password
   - Select role: "Developer"
4. **Verify email** (nếu có)

## 📋 Bước 2: Lấy API Credentials

Sau khi đăng nhập thành công, bạn sẽ thấy Dashboard với thông tin:

### Dashboard Overview
```
☁️  Cloud name: [your-cloud-name]
🔑  API Key: [your-api-key] 
🔒  API Secret: [click eye icon to reveal]
```

### Copy thông tin này:
1. **Cloud name**: Tên cloud của bạn (ví dụ: `foodee-app`)
2. **API Key**: Chuỗi số (ví dụ: `123456789012345`)  
3. **API Secret**: Click vào icon con mắt để hiện secret key

## 📋 Bước 3: Cấu hình Environment Variables

Tạo/cập nhật file `.env` trong backend:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Ví dụ thực tế**:
```bash
# Cloudinary Configuration  
CLOUDINARY_CLOUD_NAME=foodee-app
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef123456789_secret
```

## 📋 Bước 4: Test Connection

Chạy test script để kiểm tra kết nối:

```bash
cd /path/to/your/backend
npx ts-node test-cloudinary.ts
```

Nếu thành công, bạn sẽ thấy:
```
🧪 Cloudinary Service Test

✅ Environment variables found
Testing Cloudinary connection...
✅ Cloudinary connection successful!
✅ Sample transformation URL: https://res.cloudinary.com/...
✅ Video thumbnail URL: https://res.cloudinary.com/...

Testing image upload...
✅ Upload successful!
✅ Test image cleaned up

🎉 All tests passed! Cloudinary is ready to use.
```

## 📋 Bước 5: Cấu hình Upload Settings (Tùy chọn)

Trong Cloudinary Dashboard, bạn có thể cấu hình thêm:

### Settings → Upload
- **Upload presets**: Tạo preset cho các loại upload khác nhau
- **Allowed formats**: Giới hạn format file được phép
- **Max file size**: Giới hạn kích thước file
- **Auto optimization**: Enable tự động tối ưu

### Settings → Security  
- **Allowed domains**: Giới hạn domain được phép upload
- **Signed uploads**: Bắt buộc signed upload cho bảo mật cao hơn

### Media Library → Folders
- Tạo folder structure (tự động tạo khi upload)
- Ví dụ: `foodee/products/`, `foodee/users/`, `foodee/restaurants/`

## 📋 Bước 6: Monitoring & Analytics

Cloudinary cung cấp dashboard để monitor:
- **Usage**: Bandwidth, storage, transformations used
- **Credits**: Credit usage (free tier: 25 credits/month)
- **Analytics**: Popular transformations, device stats
- **Reports**: Detailed usage reports

## 🎯 Free Tier Limits

Cloudinary Free tier bao gồm:
- ✅ **25 Credits/month** (1 credit ≈ 1000 transformations hoặc 1GB storage)
- ✅ **25GB Storage**  
- ✅ **25GB Bandwidth**
- ✅ **Unlimited transformations**
- ✅ **Auto backup**
- ✅ **CDN delivery**

## 🚀 Production Setup

Khi deploy production:

1. **Upgrade plan** nếu cần (paid plans từ $89/month)
2. **Setup environment** cho production:
   ```bash
   # Production .env
   CLOUDINARY_CLOUD_NAME=foodee-production
   CLOUDINARY_API_KEY=prod-api-key
   CLOUDINARY_API_SECRET=prod-api-secret
   ```
3. **Configure CORS** trong Cloudinary settings nếu upload từ browser
4. **Setup signed uploads** cho security cao hơn

## ⚠️ Security Best Practices

1. **Không commit credentials** vào git
2. **Sử dụng .env** cho sensitive data  
3. **Rotate API keys** định kỳ
4. **Setup signed uploads** cho production
5. **Giới hạn allowed domains** trong settings
6. **Monitor usage** thường xuyên

## 🔧 Troubleshooting

### Lỗi thường gặp:

**1. "Invalid credentials"**
- Kiểm tra lại API key và secret
- Đảm bảo không có space thừa trong .env

**2. "Cloud name not found"**  
- Kiểm tra cloud name chính xác
- Cloud name chỉ chứa chữ cái, số và dấu gạch ngang

**3. "Upload failed"**
- Kiểm tra file size limit
- Kiểm tra network connection
- Kiểm tra file format có được support không

**4. "Rate limit exceeded"**
- Đã vượt quá limit của free tier
- Upgrade plan hoặc đợi tháng mới

### Debug Commands:
```bash
# Test connection
npx ts-node test-cloudinary.ts

# Check environment variables
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Test upload via curl
curl -X POST \
  "https://api.cloudinary.com/v1_1/{cloud_name}/image/upload" \
  -F "file=@/path/to/image.jpg" \
  -F "api_key={api_key}" \
  -F "timestamp={timestamp}" \
  -F "signature={signature}"
```

## 📞 Support

Nếu gặp vấn đề:
- **Documentation**: https://cloudinary.com/documentation
- **Support Center**: https://support.cloudinary.com  
- **Community**: https://community.cloudinary.com
- **Stack Overflow**: Tag `cloudinary`
