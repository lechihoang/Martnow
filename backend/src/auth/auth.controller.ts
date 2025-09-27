import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import {
  SignupDto,
  SigninDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      const result = await this.authService.signup(signupDto);
      return {
        success: true,
        data: result,
        message: 'User registered successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Registration failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('signin')
  async signin(@Body() signinDto: SigninDto) {
    try {
      const result = await this.authService.signin(signinDto);
      return {
        success: true,
        data: result,
        message: 'Login successful',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Login failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('signout')
  @UseGuards(SupabaseAuthGuard)
  async signout(@Request() req) {
    try {
      await this.authService.signout(req.user.id);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Logout failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@Request() req) {
    try {
      const profile = await this.authService.getProfile(req.user.id);
      return {
        success: true,
        data: profile,
        message: 'Profile retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get profile',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('refresh')
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    try {
      const result = await this.authService.refreshToken(
        refreshDto.refresh_token,
      );
      return {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Token refresh failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const result = await this.authService.forgotPassword(
        forgotPasswordDto.email,
      );
      return {
        success: true,
        data: result,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Forgot password failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto & { access_token: string },
  ) {
    try {
      const result = await this.authService.resetPassword(
        resetPasswordDto.access_token,
        resetPasswordDto.password,
      );
      return {
        success: true,
        data: result,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Reset password failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('change-password')
  @UseGuards(SupabaseAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req,
  ) {
    try {
      const result = await this.authService.changePassword(
        req.user.id,
        changePasswordDto.current_password,
        changePasswordDto.new_password,
      );
      return {
        success: true,
        data: result,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Change password failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('users/:id')
  @UseGuards(SupabaseAuthGuard)
  async deleteUser(@Param('id') userId: string, @Request() req) {
    try {
      // Chỉ cho phép user xóa chính mình hoặc admin
      if (req.user.id !== userId) {
        throw new HttpException(
          {
            success: false,
            message: 'You can only delete your own account',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const result = await this.authService.deleteUser(userId);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Delete user failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
