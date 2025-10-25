import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../lib/supabase';
import { User } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  phone?: string;
  buyerInfo?: {
    id: string;
  };
  sellerInfo?: {
    id: string;
    shopName?: string;
    description?: string;
  };

  constructor(user: User) {
    if (!user) {
      throw new Error('User data is required for UserResponseDto constructor');
    }

    this.id = user.id;
    this.name = user.name;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.avatar = user.avatar;
    this.address = user.address;
    this.phone = user.phone;

    if (user.buyer) {
      this.buyerInfo = {
        id: user.buyer.id,
      };
    }

    if (user.seller) {
      this.sellerInfo = {
        id: user.seller.id,
        shopName: user.seller.shopName,
        description: user.seller.description,
      };
    }
  }
}
