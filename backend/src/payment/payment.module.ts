import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/entities/order.entity';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    OrderModule,
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        tmnCode: configService.getOrThrow<string>('VNPAY_TMN_CODE'),
        secureSecret: configService.getOrThrow<string>('VNPAY_SECURE_SECRET'),
        vnpayHost: 'https://sandbox.vnpayment.vn', // Sandbox URL
        testMode: true, // Set false cho production
        hashAlgorithm: 'SHA512' as any,
        enableLog: true,
        loggerFn: () => {},
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
