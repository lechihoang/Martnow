import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../account/user/user.service';
import { UserRole } from './roles.enum';
import { RegisterDto, LoginResponseDto, LogoutResponseDto } from './dto/auth.dto';
import { CreateUserDto, UserResponseDto } from '../account/user/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Validate input parameters
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Trả về toàn bộ user (ẩn password)
        const { password: _, ...userInfo } = user;
        return userInfo;
      }
    } catch (error) {
      console.error('Bcrypt comparison error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any, request: any, response: any): Promise<LoginResponseDto> {
    // Tạo JWT payload
    const payload = {
      sub: user.id, // Subject (user ID)
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Tạo JWT access token
    const accessToken = this.jwtService.sign(payload);

    // Set JWT trong HTTP-only cookie
    response.cookie('access_token', accessToken, {
      httpOnly: true, // Không thể access từ JavaScript - bảo mật tối đa
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection nghiêm ngặt hơn
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/', // Available for entire app
    });

    // Optional: Set user info cookie cho frontend (không nhạy cảm)
    response.cookie('user_info', JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    }), {
      httpOnly: false, // Frontend có thể đọc
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      user: await this.buildAuthUserResponse(user),
    };
  }

  async logout(request: any, response: any): Promise<LogoutResponseDto> {
    // Với JWT, chúng ta chỉ cần xóa cookies
    // JWT sẽ tự động hết hạn theo thời gian cấu hình
    
    // Clear JWT cookie
    response.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    // Clear user info cookie
    response.clearCookie('user_info', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logout successful' };
  }

  async register(registerDto: RegisterDto) {
    const existingUserByEmail = await this.usersService.findByEmail?.(registerDto.email);
    if (existingUserByEmail) {
      throw new UnauthorizedException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Tạo CreateUserDto từ RegisterDto
    const createUserDto: CreateUserDto = {
      name: registerDto.name,
      username: registerDto.username,
      email: registerDto.email,
      role: registerDto.role,
      password: hashedPassword,
      avatar: registerDto.avatar,
    };
    
    return this.usersService.createUser(createUserDto);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByIdWithRelations(parseInt(userId, 10));
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return new UserResponseDto(user);
  }

  // Tạo refresh token (tùy chọn - cho session management)
  async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'refresh' };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // Refresh token có thời hạn dài hơn
  }

  // Verify refresh token
  async verifyRefreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ✅ Simplified helper method using UserResponseDto
  private async buildAuthUserResponse(user: any): Promise<UserResponseDto> {
    // Lấy full user với relations nếu cần
    const fullUser = await this.usersService.findByIdWithRelations(user.id);
    
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    
    return new UserResponseDto(fullUser);
  }
}