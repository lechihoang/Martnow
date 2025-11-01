import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../lib/supabase';
import { User } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  name: string;

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
  email: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  phone?: string;
  sellerInfo?: {
    shopName?: string;
    description?: string;
  };

  constructor(user: User) {
    if (!user) {
      throw new Error('User data is required for UserResponseDto constructor');
    }

    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.avatar = user.avatar;
    this.address = user.address;
    this.phone = user.phone;
    if (user.seller) {
      this.sellerInfo = {
        shopName: user.seller.shopName,
        description: user.seller.description,
      };
    }
  }
}
