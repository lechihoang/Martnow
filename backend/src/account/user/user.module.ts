import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Buyer } from '../buyer/entities/buyer.entity';
import { Seller } from '../seller/entities/seller.entity';
import { SellerStats } from '../../seller-stats/entities/seller-stats.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Buyer, Seller, SellerStats])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
