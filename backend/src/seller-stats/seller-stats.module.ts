import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerStatsService } from './seller-stats.service';
import { SellerStats } from './entities/seller-stats.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerStats, Order, Product])
  ],
  providers: [SellerStatsService],
  exports: [SellerStatsService],
})
export class SellerStatsModule {}
