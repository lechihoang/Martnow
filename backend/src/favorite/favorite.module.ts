import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { Favorite } from '../user/entities/favorite.entity';
import { Buyer } from '../user/entities/buyer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Buyer])],
  controllers: [FavoriteController],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
