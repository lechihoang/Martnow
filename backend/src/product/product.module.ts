import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Seller } from '../account/seller/entities/seller.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Seller]),
    AuthModule,
    MediaModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
