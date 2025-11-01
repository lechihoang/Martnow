import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Seller } from '../../account/seller/entities/seller.entity';
import { Review } from '../../review/entities/review.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { Favorite } from '../../favorite/entities/favorite.entity';

@Entity()
@Index(['sellerId']) // Index cho việc lấy products của seller
@Index(['category']) // Index cho việc lấy products theo category
@Index(['isAvailable']) // Index cho việc filter sản phẩm available
@Index(['price']) // Index cho việc sort/filter theo giá
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  sellerId: string;

  @ManyToOne(() => Seller, (seller) => seller.products)
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  // @Column({
  //   type: 'enum',
  //   enum: ProductStatus,
  //   default: ProductStatus.IN_STOCK
  // })
  // status: ProductStatus;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  // Các field để cache statistics (denormalization for performance)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'int', default: 0 })
  totalSold: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  // Field cho SEO và search
  @Column({ type: 'text', nullable: true })
  tags: string; // JSON array stored as string

  // Relations
  @OneToMany(() => Review, (review) => review.product, {
    cascade: ['remove'],
  })
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Favorite, (favorite) => favorite.product, {
    cascade: ['remove'],
  })
  favorites: Favorite[];
}
