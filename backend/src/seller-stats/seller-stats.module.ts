import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerStatsService } from './seller-stats.service';
import { SellerStats } from '../entity/seller-stats.entity';
import { Order } from '../entity/order.entity';
import { Product } from '../entity/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerStats, Order, Product])
  ],
  providers: [SellerStatsService],
  exports: [SellerStatsService],
})
export class SellerStatsModule {}
