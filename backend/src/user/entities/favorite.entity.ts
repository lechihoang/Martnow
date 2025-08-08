import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Buyer } from './buyer.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
@Unique(['buyerId', 'productId']) // Đảm bảo mỗi user chỉ có thể yêu thích 1 sản phẩm 1 lần
export class Favorite extends BaseEntity {
  @Column()
  buyerId: number;

  @Column()
  productId: number;

  @ManyToOne(() => Buyer, (buyer) => buyer.favorites)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @ManyToOne(() => Product, (product) => product.favorites)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
