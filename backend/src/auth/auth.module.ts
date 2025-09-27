import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RoleGuard } from './role.guard';
import { User } from '../account/user/entities/user.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { Seller } from '../account/seller/entities/seller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Buyer, Seller])],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, RoleGuard],
  exports: [AuthService, SupabaseAuthGuard, RoleGuard],
})
export class AuthModule {}
