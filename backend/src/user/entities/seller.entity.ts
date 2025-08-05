
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Product } from '../../product/entities/product.entity';
import { SellerStats } from './seller-stats.entity';

@Entity('sellers')
export class Seller extends BaseEntity { // id duy nhất của bảng Seller

  @Column({ unique: true })
  userId: number; // liên kết với id của bảng User, duy nhất

  @OneToOne(() => User, (user) => user.seller)
  @JoinColumn({ name: 'userId' })
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
