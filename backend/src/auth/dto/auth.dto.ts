import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../roles.enum';

// ✅ Simplified RegisterDto
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

  // ✅ Seller info as nested object (optional)
  @IsOptional()
  sellerInfo?: {
    shopName?: string;
    shopAddress?: string;
    shopPhone?: string;
    description?: string;
  };
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// ✅ Import UserResponseDto instead of duplicating
import { UserResponseDto } from '../../account/user/dto/user.dto';

// ✅ Use existing UserResponseDto instead of duplicate AuthUserResponseDto
export class LoginResponseDto {
  user: UserResponseDto;
  accessToken?: string; // If using JWT
}

export class LogoutResponseDto {
  message: string;
}
