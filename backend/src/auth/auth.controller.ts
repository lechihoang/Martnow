import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
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

interface RequestWithUser {
  user: {
    id: string;
  };
}

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
          message: (error as Error).message || 'Registration failed',
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
          message: (error as Error).message || 'Login failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('signout')
  @UseGuards(SupabaseAuthGuard)
  signout(@Request() req: RequestWithUser) {
    try {
      this.authService.signout(req.user.id);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: (error as Error).message || 'Logout failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@Request() req: RequestWithUser) {
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
          message: (error as Error).message || 'Failed to get profile',
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
          message: (error as Error).message || 'Token refresh failed',
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
          message: (error as Error).message || 'Forgot password failed',
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
          message: (error as Error).message || 'Reset password failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('change-password')
  @UseGuards(SupabaseAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: RequestWithUser,
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
          message: (error as Error).message || 'Change password failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('oauth-callback')
  @UseGuards(SupabaseAuthGuard)
  async handleOAuthCallback(
    @Body() oauthDto: { userId: string; email: string; name?: string; avatar?: string },
    @Request() req: RequestWithUser,
  ) {
    try {
      // Verify that the authenticated user matches the OAuth user
      if (req.user.id !== oauthDto.userId) {
        throw new HttpException(
          {
            success: false,
            message: 'User ID mismatch',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const result = await this.authService.handleOAuthCallback(oauthDto);
      return {
        success: true,
        data: result,
        message: result.isNewUser
          ? 'User profile created successfully'
          : 'User profile updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: (error as Error).message || 'OAuth callback failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
