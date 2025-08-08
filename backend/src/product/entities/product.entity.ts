import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Seller } from '../../user/entities/seller.entity';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';
import { Review } from '../../review/entities/review.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { Favorite } from '../../user/entities/favorite.entity';

@Entity()
export class Product extends BaseEntity {
  @Column()
  sellerId: number;

  @ManyToOne(() => Seller, (seller) => seller.products)
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;

  @Column()
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

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  images: ProductImage[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;
  
  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  // Tất cả reviews cho sản phẩm này
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  // Tất cả order items cho sản phẩm này
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  // Tất cả lượt yêu thích cho sản phẩm này
  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];
}
