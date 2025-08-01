import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Buyer } from '../entity/buyer.entity';
import { Seller } from '../entity/seller.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Buyer, Seller])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
