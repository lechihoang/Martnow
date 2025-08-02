import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
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

  async login(user: any, response: any) {
    const payload = { 
      username: user.username, 
      sub: user.id,
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Set accessToken vào httpOnly cookie
    response.setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1h
    });
    // Set refreshToken vào httpOnly cookie
    response.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7d
    });

    // Chỉ trả về user info (ẩn password)
    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        // avatar: user.avatar, // nếu có trường avatar
      },
    };
  }

  async logout(response: any) {
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/' });
    return { message: 'Logout successful' };
  }

  async register(registerDto: { name: string; username: string; email: string; role: string; password: string }) {
    const existingUserByUsername = await this.usersService.findOne(registerDto.username);
    const existingUserByEmail = await this.usersService.findByEmail?.(registerDto.email);
    if (existingUserByUsername) {
      throw new UnauthorizedException('Username already exists');
    }
    if (existingUserByEmail) {
      throw new UnauthorizedException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.usersService.createUser(
      registerDto.name,
      registerDto.username,
      registerDto.email,
      registerDto.role,
      hashedPassword
    );
  }
}