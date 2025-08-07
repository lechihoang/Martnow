import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../user/entities/user.entity';

export enum PaymentMethod {
  COD = 'cod',
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.COD
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionId: string;

  // MoMo specific fields
  @Column({ nullable: true })
  momoRequestId: string;

  @Column({ nullable: true })
  momoTransId: string;

  @Column({ nullable: true, type: 'int' })
  momoResultCode: number;

  // VNPay specific fields
  @Column({ nullable: true })
  vnpTransactionNo: string;

  @Column({ nullable: true })
  bankCode: string;

  // Common fields
  @Column('text', { nullable: true })
  gatewayResponse: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
