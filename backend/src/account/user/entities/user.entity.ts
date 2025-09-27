import { Entity, Column, OneToOne, PrimaryColumn } from 'typeorm';
import { UserRole } from '../../../lib/supabase';
import { Buyer } from '../../buyer/entities/buyer.entity';
import { Seller } from '../../seller/entities/seller.entity';

@Entity()
export class User {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string; // This will be supabase_id

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  // Relationship to buyer or seller entity (based on role)
  // A user can only be either a buyer OR a seller, not both
  @OneToOne(() => Buyer, (buyer) => buyer.user, { nullable: true })
  buyer: Buyer;

  @OneToOne(() => Seller, (seller) => seller.user, { nullable: true })
  seller: Seller;
}
