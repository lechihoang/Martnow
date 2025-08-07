import {
  Controller,
  Post,
  Body,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // Gọi service để tạo user và buyer/seller
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser( // Sử dụng method đã cập nhật
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user, response);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    // Trả về user đầy đủ với relations
    return this.authService.getProfile(req.user.userId);
  }
}
