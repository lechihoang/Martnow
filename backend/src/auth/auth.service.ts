import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserRole } from './roles.enum';
import { RegisterDto, AuthUserResponseDto, LoginResponseDto, LogoutResponseDto } from './dto/auth.dto';
import { CreateUserDto } from '../user/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      // Trả về toàn bộ user (ẩn password)
      const { password, ...userInfo } = user;
      return userInfo;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any, response: any): Promise<LoginResponseDto> {
    const payload = { 
      username: user.username, 
      sub: user.id,
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Set accessToken vào httpOnly cookie
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // Development mode, set true for production
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1h in milliseconds
    });
    // Set refreshToken vào httpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Development mode, set true for production
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in milliseconds
    });

    // Trả về user info đầy đủ để frontend có thể cập nhật state ngay
    const fullUser = await this.usersService.findByIdWithRelations(user.id);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    
    return {
      user: this.buildAuthUserResponse(fullUser),
    };
  }

  async logout(response: any): Promise<LogoutResponseDto> {
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/' });
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

  async getProfile(userId: number): Promise<AuthUserResponseDto> {
    const user = await this.usersService.findByIdWithRelations(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return this.buildAuthUserResponse(user);
  }

  // Helper method để build AuthUserResponseDto
  private buildAuthUserResponse(user: any): AuthUserResponseDto {
    const userResponse: AuthUserResponseDto = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    // Thêm buyer hoặc seller info tùy theo role
    if (user.role === UserRole.BUYER && user.buyer) {
      userResponse.buyer = {
        id: user.buyer.id,
        createdAt: user.buyer.createdAt,
      };
    } else if (user.role === UserRole.SELLER && user.seller) {
      userResponse.seller = {
        id: user.seller.id,
        shopName: user.seller.shopName,
        shopAddress: user.seller.shopAddress,
        shopPhone: user.seller.shopPhone,
        description: user.seller.description,
        createdAt: user.seller.createdAt,
      };
    }

    return userResponse;
  }
}