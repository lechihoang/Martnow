import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { Product } from '../product/entities/product.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product, Buyer])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
