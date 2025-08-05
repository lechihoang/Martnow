
import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Order } from '../../order/entities/order.entity';
import { Review } from '../../review/entities/review.entity';
import { Address } from '../../address/entities/address.entity';

@Entity()
export class Buyer extends BaseEntity {
  @Column({ unique: true })
  userId: number; // liên kết với id của bảng User, duy nhất

  @OneToOne(() => User, (user) => user.buyer)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Tất cả đơn hàng mà buyer này đã mua
  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];

  // Tất cả reviews mà buyer này đã tạo
  @OneToMany(() => Review, (review) => review.buyer)
  reviews: Review[];

  // Tất cả địa chỉ của buyer
  @OneToMany(() => Address, (address) => address.buyer)
  addresses: Address[];
}
