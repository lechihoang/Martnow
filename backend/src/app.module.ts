
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { SellerStatsModule } from './seller-stats/seller-stats.module';
import { Product } from './product/entities/product.entity';
import { Seller } from './user/entities/seller.entity';
import { Category } from './product/entities/category.entity';
import { User } from './user/entities/user.entity';
import { Buyer } from './user/entities/buyer.entity';
import { Address } from './address/entities/address.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Review } from './review/entities/review.entity';
import { SellerStats } from './user/entities/seller-stats.entity';
import { ProductImage } from './product/entities/product-image.entity';

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
        entities: [Product, Seller, Category, User, Buyer, Address, Order, OrderItem, Review, SellerStats, ProductImage],
        synchronize: true, // chỉ dùng cho dev, không nên dùng cho production
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    UserModule,
    ProductModule,
    OrderModule,
    AuthModule,
    SellerStatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
