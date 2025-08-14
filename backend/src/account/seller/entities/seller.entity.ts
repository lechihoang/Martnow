import { Entity, Column, OneToOne, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../../product/entities/product.entity';
import { SellerStats } from '../../../seller-stats/entities/seller-stats.entity';

@Entity('seller')
export class Seller {
  @PrimaryColumn()
  id: number; // This is the userId from User table

  @OneToOne(() => User, (user) => user.seller)
  @JoinColumn({ name: 'id' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shopName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shopAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shopPhone: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Tất cả sản phẩm của seller
  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  // Statistics của seller
  @OneToOne(() => SellerStats, (stats) => stats.seller)
  stats: SellerStats;
}
