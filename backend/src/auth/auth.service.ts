import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserRole } from './roles.enum';
import { RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      // Trả về toàn bộ user (ẩn password)
      const { password, ...userInfo } = user;
      return userInfo;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async validateUserByEmail(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      // Trả về toàn bộ user (ẩn password)
      const { password: userPassword, ...userInfo } = user;
      return userInfo;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any, response: any) {
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
    
    // Tạo response object chỉ với thông tin cần thiết
    const userResponse: any = {
      id: fullUser.id,
      name: fullUser.name,
      username: fullUser.username,
      email: fullUser.email,
      role: fullUser.role,
      avatar: fullUser.avatar,
    };

    // Thêm buyer hoặc seller info tùy theo role
    if (fullUser.role === UserRole.BUYER && fullUser.buyer) {
      userResponse.buyer = fullUser.buyer;
    } else if (fullUser.role === UserRole.SELLER && fullUser.seller) {
      userResponse.seller = fullUser.seller;
    }
    
    return {
      user: userResponse,
    };
  }

  async logout(response: any) {
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/' });
    return { message: 'Logout successful' };
  }

  async register(registerDto: RegisterDto) {
    const existingUserByUsername = await this.usersService.findOne(registerDto.username);
    const existingUserByEmail = await this.usersService.findByEmail?.(registerDto.email);
    if (existingUserByUsername) {
      throw new UnauthorizedException('Username already exists');
    }
    if (existingUserByEmail) {
      throw new UnauthorizedException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Tạo CreateUserDto từ RegisterDto
    const createUserDto = {
      name: registerDto.name,
      username: registerDto.username,
      email: registerDto.email,
      role: registerDto.role,
      password: hashedPassword,
      avatar: registerDto.avatar,
    };
    
    return this.usersService.createUser(createUserDto);
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findByIdWithRelations(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Trả về user info không có password
    const { password, ...userInfo } = user;
    
    // Tạo response object chỉ với thông tin cần thiết
    const userResponse: any = {
      id: userInfo.id,
      name: userInfo.name,
      username: userInfo.username,
      email: userInfo.email,
      role: userInfo.role,
      avatar: userInfo.avatar,
    };

    // Thêm buyer hoặc seller info tùy theo role
    if (userInfo.role === UserRole.BUYER && userInfo.buyer) {
      userResponse.buyer = userInfo.buyer;
    } else if (userInfo.role === UserRole.SELLER && userInfo.seller) {
      userResponse.seller = userInfo.seller;
    }

    return userResponse;
  }
}