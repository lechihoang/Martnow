import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  username?: string;
}

export class SigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  current_password: string;

  @IsString()
  @MinLength(6)
  new_password: string;
}
