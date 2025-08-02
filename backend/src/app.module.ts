
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { Product } from './entity/product.entity';
import { Seller } from './entity/seller.entity';
import { Category } from './entity/category.entity';
import { User } from './entity/user.entity';
import { Buyer } from './entity/buyer.entity';
import { Address } from './entity/address.entity';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { Review } from './entity/review.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT', '5432'), 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Product, Seller, Category, User, Buyer, Address, Order, OrderItem, Review],
        synchronize: true, // chỉ dùng cho dev, không nên dùng cho production
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    UserModule,
    ProductModule,
    OrderModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
