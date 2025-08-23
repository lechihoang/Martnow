import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { MediaFile } from './media/entities/media-file.entity';
import { Room } from './chat/entities/room.entity';
import { Message } from './chat/entities/message.entity';
// import { Blog } from './blog/entities/blog.entity';
// import { BlogComment } from './blog/entities/blog-comment.entity';
// import { BlogVote } from './blog/entities/blog-vote.entity';
import { PaymentModule } from './payment/payment.module';
import { CartModule } from './cart/cart.module';
import { ChatModule } from './chat/chat.module';
// import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
        entities: [Product, Seller, Category, User, Buyer, Order, OrderItem, Review, SellerStats, Favorite, MediaFile /*, Room, Message, Blog, BlogComment, BlogVote*/],
        synchronize: true, // bật lại để có foreign keys và constraints
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
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
    CartModule,
    // ChatModule,
    // BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
