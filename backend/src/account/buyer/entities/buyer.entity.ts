import { Entity, Column, OneToOne, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../../order/entities/order.entity';
import { Review } from '../../../review/entities/review.entity';
import { Favorite } from '../../../favorite/entities/favorite.entity';

@Entity()
export class Buyer {
  @PrimaryColumn() // Sử dụng userId làm PK luôn
  id: number; // Chính là userId

  @OneToOne(() => User, (user) => user.buyer)
  @JoinColumn({ name: 'id' }) // Join bằng id chính
  user: User;

  // Tất cả đơn hàng mà buyer này đã mua
  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];

  // Tất cả reviews mà buyer này đã tạo
  @OneToMany(() => Review, (review) => review.buyer)
  reviews: Review[];

  // Tất cả sản phẩm yêu thích của buyer
  @OneToMany(() => Favorite, (favorite) => favorite.buyer)
  favorites: Favorite[];
}
