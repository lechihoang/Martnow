import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MoMoService } from './services/momo.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, MoMoService],
  exports: [PaymentService, MoMoService],
})
export class PaymentModule {}
