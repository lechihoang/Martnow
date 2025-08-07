import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../roles.enum';

export class RegisterDto {
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

  // Seller fields - optional for when registering as seller
  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  shopAddress?: string;

  @IsString()
  @IsOptional()
  shopPhone?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// Response DTOs
export class AuthUserResponseDto {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  buyer?: {
    id: number;
    createdAt: Date;
  };
  seller?: {
    id: number;
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    description?: string;
    createdAt: Date;
  };
}

export class LoginResponseDto {
  user: AuthUserResponseDto;
}

export class LogoutResponseDto {
  message: string;
}
