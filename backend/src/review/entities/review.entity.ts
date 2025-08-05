import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Buyer } from '../../user/entities/buyer.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class Review extends BaseEntity {
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  buyerId: number;

  @ManyToOne(() => Buyer, (buyer) => buyer.reviews)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.reviews)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
