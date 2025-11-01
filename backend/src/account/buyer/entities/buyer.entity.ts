import {
  Entity,
  OneToOne,
  PrimaryColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../../order/entities/order.entity';
import { Review } from '../../../review/entities/review.entity';
import { Favorite } from '../../../favorite/entities/favorite.entity';

@Entity()
export class Buyer {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string; // This will be the same as user.id (supabase_id)

  @OneToOne(() => User, (user) => user.buyer)
  @JoinColumn({ name: 'id' })
  user: User;

  // Tất cả đơn hàng mà buyer này đã mua
  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];

  // Tất cả reviews mà buyer này đã tạo
  @OneToMany(() => Review, (review) => review.buyer, {
    cascade: ['remove'],
  })
  reviews: Review[];

  // Tất cả sản phẩm yêu thích của buyer (sync với backend)
  @OneToMany(() => Favorite, (favorite) => favorite.buyer, {
    cascade: ['remove'],
  })
  favorites: Favorite[];
}
