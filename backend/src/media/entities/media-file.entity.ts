import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('media_files')
export class MediaFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  publicId: string; // Cloudinary public_id

  @Column({ type: 'varchar', length: 500 })
  secureUrl: string; // Cloudinary secure URL (HTTPS)

  @Column({ type: 'varchar', length: 50 })
  fileType: string; // image, video

  @Column({ type: 'varchar', length: 50 })
  entityType: string; // product, user, seller

  @Column()
  entityId: number; // ID của entity (productId, userId, etc.)

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean; // Ảnh chính hay không

  @CreateDateColumn()
  createdAt: Date;
}
