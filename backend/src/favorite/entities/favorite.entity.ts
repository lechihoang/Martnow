import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Buyer } from '../../account/buyer/entities/buyer.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class Favorite {
  @PrimaryColumn({ type: 'varchar' })
  buyerId: string;

  @PrimaryColumn({ type: 'int' })
  productId: number;

  @ManyToOne(() => Buyer, (buyer) => buyer.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @ManyToOne(() => Product, (product) => product.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
