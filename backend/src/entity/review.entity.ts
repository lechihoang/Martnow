import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Buyer } from './buyer.entity';
import { Product } from './product.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Buyer)
  buyer: Buyer;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
