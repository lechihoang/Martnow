import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Seller } from '../../account/seller/entities/seller.entity';
import { Category } from './category.entity';
import { Review } from '../../review/entities/review.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { Favorite } from '../../favorite/entities/favorite.entity';
import { ProductStatus } from '../../shared/enums';

@Entity()
@Index(['sellerId']) // Index cho việc lấy products của seller
@Index(['categoryId']) // Index cho việc lấy products theo category
@Index(['isAvailable']) // Index cho việc filter sản phẩm available
@Index(['price']) // Index cho việc sort/filter theo giá
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'int' })
  sellerId: number;

  @ManyToOne(() => Seller, (seller) => seller.products)
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;

  @Column({ type: 'int' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

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
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];
}
