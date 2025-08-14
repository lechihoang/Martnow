import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { Product } from '../product/entities/product.entity';
import { SellerStats } from '../seller-stats/entities/seller-stats.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderBusinessService } from './order-business.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Buyer, Product, SellerStats]),
    AuthModule
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderBusinessService],
  exports: [OrderService, OrderBusinessService],
})
export class OrderModule {}
