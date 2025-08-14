import { Entity, Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../../auth/roles.enum';
import { Buyer } from '../../buyer/entities/buyer.entity';
import { Seller } from '../../seller/entities/seller.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  // Relationships to buyer and seller entities
  @OneToOne(() => Buyer, (buyer) => buyer.user)
  buyer: Buyer;

  @OneToOne(() => Seller, (seller) => seller.user)
  seller: Seller;
}
