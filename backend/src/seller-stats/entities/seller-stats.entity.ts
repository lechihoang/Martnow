import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Seller } from '../../account/seller/entities/seller.entity';

@Entity('seller_stats')
export class SellerStats {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string; // This is the seller.id which is supabase_id

  @OneToOne(() => Seller, (seller) => seller.stats)
  @JoinColumn({ name: 'id' })
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
