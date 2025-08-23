import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Buyer } from '../../account/buyer/entities/buyer.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
@Index(['productId']) // Index cho việc lấy reviews của sản phẩm
@Index(['buyerId']) // Index cho việc lấy reviews của buyer
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  
  @Column({ type: 'int' })
  buyerId: number; // Reference to Buyer.id

  @ManyToOne(() => Buyer, (buyer) => buyer.reviews)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.reviews)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;
}
