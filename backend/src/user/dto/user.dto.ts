import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  avatar?: string;
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

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  avatar?: string;
}

export class UserResponseDto {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  buyerInfo?: {
    id: number;
    createdAt: Date;
  };
  sellerInfo?: {
    id: number;
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    description?: string;
    createdAt: Date;
  };

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    if (user.buyer) {
      this.buyerInfo = {
        id: user.buyer.id,
        createdAt: user.buyer.createdAt,
      };
    }

    if (user.seller) {
      this.sellerInfo = {
        id: user.seller.id,
        shopName: user.seller.shopName,
        shopAddress: user.seller.shopAddress,
        shopPhone: user.seller.shopPhone,
        description: user.seller.description,
        createdAt: user.seller.createdAt,
      };
    }
  }
}
