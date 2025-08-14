import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Buyer } from '../buyer/entities/buyer.entity';
import { Seller } from '../seller/entities/seller.entity';
import { SellerStats } from '../../seller-stats/entities/seller-stats.entity';
import { Review } from '../../review/entities/review.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { UserService } from './user.service';
import { UserActivityService } from './user-activity.service';
import { UserActivityController } from './user-activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Buyer, Seller, SellerStats, Review, Order, OrderItem])],
  providers: [UserService, UserActivityService],
  controllers: [UserActivityController],
  exports: [UserService, UserActivityService],
})
export class UserModule {}
