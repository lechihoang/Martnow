import {
  Controller,
  Post,
  Body,
  Request,
  Res,
  UseGuards,
  Get,
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
    @Request() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user, request, response);
  }

  @Post('logout')
  async logout(
    @Request() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(request, response);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() request) {
    return this.authService.getProfile(request.user.userId);
  }

  // JWT status check
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getAuthStatus(@Request() request) {
    return {
      isAuthenticated: true,
      user: request.user,
    };
  }
}
