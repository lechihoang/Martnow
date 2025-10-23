import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRole } from '../../lib/supabase';
import { Reflector } from '@nestjs/core';
import { SupabaseAuthGuard } from '../supabase-auth.guard';
import { RoleGuard } from '../role.guard';

interface RequestWithUser {
  user: {
    id: string;
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    signin: jest.fn(),
    signout: jest.fn(),
    getProfile: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        Reflector,
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      username: 'testuser',
    };

    const mockResult = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        role: UserRole.BUYER,
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      },
    };

    it('should successfully sign up a user', async () => {
      mockAuthService.signup.mockResolvedValue(mockResult);

      const result = await controller.signup(signupDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'User registered successfully',
      });

      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });

    it('should throw HttpException on signup failure', async () => {
      mockAuthService.signup.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(controller.signup(signupDto)).rejects.toThrow(HttpException);

      try {
        await controller.signup(signupDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as HttpException).getResponse()).toEqual({
          success: false,
          message: 'Email already exists',
        });
      }
    });
  });

  describe('signin', () => {
    const signinDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResult = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        role: UserRole.BUYER,
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      },
    };

    it('should successfully sign in a user', async () => {
      mockAuthService.signin.mockResolvedValue(mockResult);

      const result = await controller.signin(signinDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Login successful',
      });

      expect(authService.signin).toHaveBeenCalledWith(signinDto);
    });

    it('should throw HttpException with UNAUTHORIZED status on signin failure', async () => {
      mockAuthService.signin.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(controller.signin(signinDto)).rejects.toThrow(HttpException);

      try {
        await controller.signin(signinDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.UNAUTHORIZED,
        );
        expect((error as HttpException).getResponse()).toEqual({
          success: false,
          message: 'Invalid credentials',
        });
      }
    });
  });

  describe('signout', () => {
    const mockRequest: RequestWithUser = {
      user: {
        id: 'user-123',
      },
    };

    it('should successfully sign out a user', () => {
      mockAuthService.signout.mockReturnValue({
        message: 'Signed out successfully',
      });

      const result = controller.signout(mockRequest);

      expect(result).toEqual({
        success: true,
        message: 'Logout successful',
      });

      const mockFn = authService.signout as jest.MockedFunction<typeof authService.signout>;
      expect(mockFn).toHaveBeenCalledWith('user-123');
    });

    it('should throw HttpException on signout failure', () => {
      mockAuthService.signout.mockImplementation(() => {
        throw new Error('Signout failed');
      });

      expect(() => controller.signout(mockRequest)).toThrow(HttpException);

      try {
        controller.signout(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('getProfile', () => {
    const mockRequest: RequestWithUser = {
      user: {
        id: 'user-123',
      },
    };

    const mockProfile = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
      role: UserRole.BUYER,
      avatar: 'avatar.jpg',
      address: '123 Street',
      phone: '1234567890',
    };

    it('should successfully get user profile', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockProfile,
        message: 'Profile retrieved successfully',
      });

      expect(authService.getProfile).toHaveBeenCalledWith('user-123');
    });

    it('should throw HttpException when profile retrieval fails', async () => {
      mockAuthService.getProfile.mockRejectedValue(new Error('User not found'));

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(
        HttpException,
      );

      try {
        await controller.getProfile(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as HttpException).getResponse()).toEqual({
          success: false,
          message: 'User not found',
        });
      }
    });
  });

  describe('refreshToken', () => {
    const refreshDto = {
      refresh_token: 'mock-refresh-token',
    };

    const mockResult = {
      session: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      },
    };

    it('should successfully refresh token', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockResult);

      const result = await controller.refreshToken(refreshDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Token refreshed successfully',
      });

      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshDto.refresh_token,
      );
    });

    it('should throw HttpException with UNAUTHORIZED status on refresh failure', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Invalid refresh token'),
      );

      await expect(controller.refreshToken(refreshDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await controller.refreshToken(refreshDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.UNAUTHORIZED,
        );
        expect((error as HttpException).getResponse()).toEqual({
          success: false,
          message: 'Invalid refresh token',
        });
      }
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto = {
      email: 'test@example.com',
    };

    const mockResult = {
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    };

    it('should successfully process forgot password request', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(mockResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: mockResult.message,
      });

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });

    it('should throw HttpException on forgot password failure', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(
        new Error('Email service error'),
      );

      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(HttpException);

      try {
        await controller.forgotPassword(forgotPasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      access_token: 'reset-access-token',
      password: 'newPassword123',
    };

    const mockResult = {
      success: true,
      message: 'Password reset successfully',
    };

    it('should successfully reset password', async () => {
      mockAuthService.resetPassword.mockResolvedValue(mockResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: mockResult.message,
      });

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.access_token,
        resetPasswordDto.password,
      );
    });

    it('should throw HttpException on reset password failure', async () => {
      mockAuthService.resetPassword.mockRejectedValue(
        new Error('Invalid or expired token'),
      );

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        HttpException,
      );

      try {
        await controller.resetPassword(resetPasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as HttpException).getResponse()).toEqual({
          success: false,
          message: 'Invalid or expired token',
        });
      }
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      current_password: 'oldPassword123',
      new_password: 'newPassword123',
    };

    const mockRequest: RequestWithUser = {
      user: {
        id: 'user-123',
      },
    };

    const mockResult = {
      success: true,
      message: 'Password changed successfully',
    };

    it('should successfully change password', async () => {
      mockAuthService.changePassword.mockResolvedValue(mockResult);

      const result = await controller.changePassword(
        changePasswordDto,
        mockRequest,
      );

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: mockResult.message,
      });

      expect(authService.changePassword).toHaveBeenCalledWith(
        'user-123',
        changePasswordDto.current_password,
        changePasswordDto.new_password,
      );
    });

    it('should throw HttpException on change password failure', async () => {
      mockAuthService.changePassword.mockRejectedValue(
        new Error('Current password is incorrect'),
      );

      await expect(
        controller.changePassword(changePasswordDto, mockRequest),
      ).rejects.toThrow(HttpException);

      try {
        await controller.changePassword(changePasswordDto, mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as HttpException).getResponse()).toEqual({
          success: false,
          message: 'Current password is incorrect',
        });
      }
    });
  });
});
