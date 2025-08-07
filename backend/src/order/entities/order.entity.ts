import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Buyer } from '../../user/entities/buyer.entity';
import { Address } from '../../address/entities/address.entity';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order extends BaseEntity {
  @Column()
  buyerId: number;

  @ManyToOne(() => Buyer, (buyer) => buyer.orders)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @Column({ nullable: true })
  addressId: number;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 20 })
  status: string; // pending, confirmed, delivering, completed, cancelled

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  // Payment relationship  
  @OneToMany('Payment', 'order')
  payments: any[];
}
