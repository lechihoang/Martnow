import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('media_files')
export class MediaFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  publicId: string; // Cloudinary public_id

  @Column({ type: 'varchar', length: 500 })
  url: string; // Cloudinary URL

  @Column({ type: 'varchar', length: 500 })
  secureUrl: string; // Cloudinary secure URL (HTTPS)

  @Column({ type: 'varchar', length: 50 })
  fileType: string; // image, video

  @Column({ type: 'varchar', length: 100 })
  mimeType: string; // image/jpeg, video/mp4, etc.

  @Column({ type: 'bigint' })
  fileSize: number; // Size in bytes

  @Column({ type: 'int', nullable: true })
  width?: number; // Width for images/videos

  @Column({ type: 'int', nullable: true })
  height?: number; // Height for images/videos

  @Column({ type: 'float', nullable: true })
  duration?: number; // Duration for videos (in seconds)

  @Column({ type: 'varchar', length: 50 })
  entityType: string; // product, user, restaurant

  @Column()
  entityId: number; // ID của entity (productId, userId, etc.)

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean; // Ảnh chính hay không

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // Thứ tự hiển thị

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Optional: Relationship với Product (nếu cần)
  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'entityId' })
  product?: Product;

  // Virtual property để tạo thumbnail URL
  get thumbnailUrl(): string {
    if (this.fileType === 'video') {
      // For videos, generate thumbnail from Cloudinary
      return this.secureUrl.replace('/video/upload/', '/video/upload/c_fill,w_300,h_300,so_1,f_jpg/');
    } else {
      // For images, generate thumbnail
      return this.secureUrl.replace('/image/upload/', '/image/upload/c_fill,w_300,h_300,q_auto,f_auto/');
    }
  }
}
