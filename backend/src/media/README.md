# Media Service with Cloudinary

Hệ thống quản lý media files sử dụng Cloudinary để upload và lưu trữ ảnh, video.

## Cấu hình

Thêm các biến môi trường sau vào `.env`:

```bash
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key  
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Tính năng

### 1. Upload Media Files
- Hỗ trợ upload multiple files (tối đa 10 files)
- Tự động tối ưu hóa chất lượng ảnh
- Hỗ trợ format: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG, MP4, MPEG, QuickTime, AVI, WebM, FLV, 3GP
- Giới hạn kích thước: 100MB

### 2. Media Management
- Quản lý media theo entity (product, user, restaurant)
- Set primary media (ảnh đại diện)
- Sắp xếp thứ tự media
- Xóa media files

### 3. Cloudinary Features
- Tự động tạo thumbnail
- Transformation URLs cho resize, crop, filter
- Video thumbnail generation
- Tối ưu hóa tự động (quality, format)

## API Endpoints

### Upload Media
```bash
POST /media/upload
Content-Type: multipart/form-data

# Body:
files: File[] (max 10 files)
entityType: string (product, user, restaurant)
entityId: number
isPrimary?: boolean[] (optional, array indicating which files are primary)
```

### Get Media Files
```bash
GET /media/:entityType/:entityId

# Example:
GET /media/product/123
```

### Update Media Files
```bash
PUT /media/:entityType/:entityId
Content-Type: multipart/form-data

# Body:
files: File[] (new files to add)
filesToDelete?: number[] (IDs of files to delete)
primaryFileId?: number (ID of file to set as primary)
```

### Delete All Media
```bash
DELETE /media/:entityType/:entityId
```

### Set Primary Media
```bash
PUT /media/primary/:mediaFileId
```

### Reorder Media
```bash
PUT /media/reorder/:entityType/:entityId

# Body:
{
  "fileIds": [1, 3, 2, 4] // Array of media file IDs in desired order
}
```

### Generate Thumbnail
```bash
GET /media/thumbnail/:mediaFileId
```

### Generate Transformation URL
```bash
POST /media/transform

# Body:
{
  "publicId": "foodee/product/2024/01/123/abc-123",
  "transformations": [
    { "width": 300, "height": 300, "crop": "fill" },
    { "quality": "auto" }
  ]
}
```

## Database Schema

Media files được lưu trong bảng `media_files`:

```sql
CREATE TABLE media_files (
  id SERIAL PRIMARY KEY,
  fileName VARCHAR(255) NOT NULL,
  publicId VARCHAR(500) NOT NULL, -- Cloudinary public_id
  url VARCHAR(500) NOT NULL, -- Cloudinary URL
  secureUrl VARCHAR(500) NOT NULL, -- Cloudinary secure URL (HTTPS)
  fileType VARCHAR(50) NOT NULL, -- 'image' | 'video'
  mimeType VARCHAR(100) NOT NULL,
  fileSize BIGINT NOT NULL,
  width INTEGER, -- Width for images/videos
  height INTEGER, -- Height for images/videos  
  duration REAL, -- Duration for videos (seconds)
  entityType VARCHAR(50) NOT NULL, -- 'product' | 'user' | 'restaurant'
  entityId INTEGER NOT NULL,
  isPrimary BOOLEAN DEFAULT FALSE,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Migration từ S3

Nếu đang migrate từ S3, chạy migration:

```bash
npm run migration:run
```

Migration sẽ:
1. Thêm các column mới cho Cloudinary
2. Copy dữ liệu từ S3 columns sang Cloudinary columns  
3. Xóa S3 columns cũ

## Sử dụng trong Code

### Inject MediaService
```typescript
import { MediaService } from '@/media/media.service';

@Injectable()
export class ProductService {
  constructor(
    private mediaService: MediaService
  ) {}

  async createProduct(productData: any, files: Express.Multer.File[]) {
    // Create product first
    const product = await this.productRepository.save(productData);
    
    // Upload media files
    if (files && files.length > 0) {
      await this.mediaService.uploadMediaFiles({
        entityType: 'product',
        entityId: product.id,
        files,
        isPrimary: [true, ...Array(files.length - 1).fill(false)] // First file is primary
      });
    }
    
    return product;
  }
}
```

### Get Media với Entity
```typescript
// Get product with media
const product = await this.productRepository.findOne({ where: { id } });
const mediaFiles = await this.mediaService.getMediaFiles('product', product.id);

return {
  ...product,
  mediaFiles
};
```

## Thumbnail URLs

Mỗi MediaFile entity có virtual property `thumbnailUrl`:

```typescript
const mediaFile = await this.mediaService.getPrimaryMediaFile('product', productId);
console.log(mediaFile.secureUrl); // Original URL
console.log(mediaFile.thumbnailUrl); // Auto-generated thumbnail URL
```

## Cloudinary Transformations

### Resize Image
```typescript
const thumbnailUrl = this.cloudinaryService.generateThumbnailUrl(
  publicId, 
  300, // width
  300  // height
);
```

### Custom Transformations
```typescript
const transformedUrl = this.cloudinaryService.generateTransformationUrl(
  publicId,
  [
    { width: 500, height: 500, crop: 'fill' },
    { quality: 'auto' },
    { format: 'webp' }
  ]
);
```

### Video Thumbnail
```typescript
const videoThumbnail = this.cloudinaryService.generateVideoThumbnail(
  publicId,
  300, // width  
  300  // height
);
```

## Best Practices

1. **Folder Organization**: Media files được tự động organize theo pattern:
   ```
   foodee/{entityType}/{year}/{month}/{entityId}/
   ```

2. **File Validation**: Service tự động validate:
   - File size (max 100MB)
   - File type (chỉ cho phép image/video formats)
   
3. **Error Handling**: 
   - Upload fail sẽ throw BadRequestException
   - Delete fail sẽ log error nhưng không block database operations

4. **Performance**:
   - Cloudinary tự động optimize quality và format
   - Sử dụng secure URLs (HTTPS)
   - Lazy loading cho thumbnails

5. **Security**:
   - Không expose Cloudinary credentials
   - Validate file types trước khi upload
   - Sử dụng signed URLs khi cần thiết
