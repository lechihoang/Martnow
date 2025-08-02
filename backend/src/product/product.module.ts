import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entity/product.entity';
import { ProductController } from './product.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule
  ],
  controllers: [ProductController],
  providers: [],
  exports: [],
})
export class ProductModule {}
