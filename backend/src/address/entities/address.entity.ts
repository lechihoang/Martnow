import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Buyer } from '../../user/entities/buyer.entity';

@Entity()
export class Address extends BaseEntity {
  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  buyerId: number;

  @ManyToOne(() => Buyer, (buyer) => buyer.addresses)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @Column({ type: 'varchar', length: 255 })
  addressLine: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  ward: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;
}
