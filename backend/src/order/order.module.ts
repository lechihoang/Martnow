import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entity/order.entity';
import { Buyer } from '../entity/buyer.entity';
import { OrderController } from './order.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Buyer]),
    AuthModule
  ],
  controllers: [OrderController],
  providers: [],
  exports: [],
})
export class OrderModule {}
