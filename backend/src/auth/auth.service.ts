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
      return { id: user.id, username: user.username };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any, response: any) {
    const payload = { username: user.username, sub: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    response.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    return { accessToken };
  }

  async logout(response: any) {
    response.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }

  async register(registerDto: { name: string; username: string; email: string; role: string; password: string }) {
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