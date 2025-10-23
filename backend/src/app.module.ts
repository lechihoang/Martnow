import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountModule } from './account/account.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { SellerStatsModule } from './seller-stats/seller-stats.module';
import { ReviewModule } from './review/review.module';
import { FavoriteModule } from './favorite/favorite.module';
import { MediaModule } from './media/media.module';
import { Product } from './product/entities/product.entity';
import { Seller } from './account/seller/entities/seller.entity';
import { Category } from './product/entities/category.entity';
import { User } from './account/user/entities/user.entity';
import { Buyer } from './account/buyer/entities/buyer.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Review } from './review/entities/review.entity';
import { SellerStats } from './seller-stats/entities/seller-stats.entity';
import { Favorite } from './favorite/entities/favorite.entity';
import { Blog } from './blog/entities/blog.entity';
import { BlogComment } from './blog/entities/blog-comment.entity';
import { BlogVote } from './blog/entities/blog-vote.entity';
import { PaymentModule } from './payment/payment.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [
          Product,
          Seller,
          Category,
          User,
          Buyer,
          Order,
          OrderItem,
          Review,
          SellerStats,
          Favorite,
          Blog,
          BlogComment,
          BlogVote,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          max: 20,
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
        },
      }),
    }),
    AccountModule,
    ProductModule,
    OrderModule,
    AuthModule,
    SellerStatsModule,
    ReviewModule,
    FavoriteModule,
    MediaModule,
    PaymentModule,
    BlogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
