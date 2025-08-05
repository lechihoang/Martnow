import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity()
export class ProductImage extends BaseEntity {

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'text' })
  imageData: string; // Lưu base64 string của ảnh

  @Column({ type: 'varchar', length: 100 })
  mimeType: string; // image/jpeg, image/png, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalName: string;

  @Column({ type: 'int' })
  fileSize: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

}
