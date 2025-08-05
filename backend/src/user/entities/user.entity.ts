import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../auth/roles.enum';
import { Buyer } from './buyer.entity';
import { Seller } from './seller.entity';
import { Review } from '../../review/entities/review.entity';

@Entity()
export class User extends BaseEntity {
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

  // Relationship với Buyer (nếu user là buyer)
  @OneToOne(() => Buyer, (buyer) => buyer.user)
  buyer: Buyer;

  // Relationship với Seller (nếu user là seller)
  @OneToOne(() => Seller, (seller) => seller.user)
  seller: Seller;

  // Tất cả reviews mà user này đã tạo
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
