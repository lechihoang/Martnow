import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Buyer } from '../../account/buyer/entities/buyer.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class Favorite {
  @PrimaryColumn()
  buyerId: number;

  @PrimaryColumn()
  productId: number;

  @ManyToOne(() => Buyer, (buyer) => buyer.favorites)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @ManyToOne(() => Product, (product) => product.favorites)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
