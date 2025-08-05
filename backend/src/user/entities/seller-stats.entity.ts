import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Seller } from './seller.entity';

@Entity('seller_stats')
export class SellerStats extends BaseEntity {

  @Column({ unique: true })
  sellerId: number;

  @OneToOne(() => Seller, (seller) => seller.stats)
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'int', default: 0 })
  totalProducts: number;

  @Column({ type: 'int', default: 0 })
  pendingOrders: number;

  @Column({ type: 'int', default: 0 })
  completedOrders: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

}
