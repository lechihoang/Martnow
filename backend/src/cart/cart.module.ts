import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { PaymentModule } from '../payment/payment.module';
import { OrderBusinessService } from '../order/order-business.service';
import { SellerStats } from '../seller-stats/entities/seller-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Buyer,
      SellerStats,
    ]),
    PaymentModule,
  ],
  controllers: [CartController],
  providers: [CartService, OrderBusinessService],
  exports: [CartService],
})
export class CartModule {}
