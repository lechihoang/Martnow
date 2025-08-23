import { Entity, Column, ManyToOne, OneToMany, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Buyer } from '../../account/buyer/entities/buyer.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../shared/enums';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @Column({ type: 'int' })
  buyerId: number;

  @ManyToOne(() => Buyer, (buyer) => buyer.orders)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ 
    type: 'enum', 
    enum: OrderStatus, 
    default: OrderStatus.PAID 
  })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  // Thêm các fields cho VNPay
  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string; // Transaction reference từ VNPay

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date; // Thời gian thanh toán thành công

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
