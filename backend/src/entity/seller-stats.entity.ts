import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Seller } from './seller.entity';

@Entity()
export class SellerStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sellerId: number;

  @OneToOne(() => Seller)
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
