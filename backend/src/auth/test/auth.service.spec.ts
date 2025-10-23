import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../account/user/entities/user.entity';
import { Buyer } from '../../account/buyer/entities/buyer.entity';
import { Seller } from '../../account/seller/entities/seller.entity';
import { UserRole } from '../../lib/supabase';

// Mock supabase module
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      refreshSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      admin: {
        deleteUser: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  },
  UserRole: {
    BUYER: 'BUYER',
    SELLER: 'SELLER',
  },
}));

// Mock @supabase/supabase-js createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockBuyerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockSellerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Buyer),
          useValue: mockBuyerRepository,
        },
        {
          provide: getRepositoryToken(Seller),
          useValue: mockSellerRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      username: 'testuser',
    };

    const mockAuthData = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      },
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
      role: UserRole.BUYER,
    };

    it('should successfully sign up a new user', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.signUp as jest.Mock).mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const mockBuyer = { id: 'user-123' };
      mockBuyerRepository.create.mockReturnValue(mockBuyer);
      mockBuyerRepository.save.mockResolvedValue(mockBuyer);

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          username: 'testuser',
          role: UserRole.BUYER,
        },
        session: mockAuthData.session,
      });

      expect(supabase!.auth.signUp).toHaveBeenCalledWith({
        email: signupDto.email,
        password: signupDto.password,
        options: {
          data: {
            name: signupDto.name,
            username: signupDto.username,
          },
        },
      });

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockBuyerRepository.create).toHaveBeenCalled();
      expect(mockBuyerRepository.save).toHaveBeenCalled();
    });

    it('should use default values when name and username are not provided', async () => {
      const { supabase } = await import('../../lib/supabase');

      const minimalSignupDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (supabase!.auth.signUp as jest.Mock).mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockBuyerRepository.create.mockReturnValue({ id: 'user-123' });
      mockBuyerRepository.save.mockResolvedValue({ id: 'user-123' });

      await service.signup(minimalSignupDto);

      expect(supabase!.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: expect.objectContaining({
              name: 'User',
            }),
          }),
        }),
      );
    });

    it('should throw error when Supabase signup fails', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      });

      await expect(service.signup(signupDto)).rejects.toThrow(
        'Signup failed: Email already exists',
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when user creation fails', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.signUp as jest.Mock).mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.signup(signupDto)).rejects.toThrow();
    });
  });

  describe('signin', () => {
    const signinDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthData = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      session: {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      },
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
      role: UserRole.BUYER,
    };

    it('should successfully sign in a user', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.signin(signinDto);

      expect(result).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          username: 'testuser',
          role: UserRole.BUYER,
        },
        session: mockAuthData.session,
      });

      expect(supabase!.auth.signInWithPassword).toHaveBeenCalledWith(signinDto);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw error for invalid credentials', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.signin(signinDto)).rejects.toThrow(
        'Signin failed: Invalid login credentials',
      );

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw error when user profile not found in database', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.signin(signinDto)).rejects.toThrow(
        'Signin failed: User profile not found',
      );
    });
  });

  describe('signout', () => {
    it('should successfully sign out a user (stateless)', () => {
      const result = service.signout('user-123');

      expect(result).toEqual({ message: 'Signed out successfully' });
      // No Supabase call is made as signout is now stateless
    });

    it('should handle errors gracefully', () => {
      // Even if there's an error, signout should succeed as it's stateless
      const result = service.signout('user-123');

      expect(result).toEqual({ message: 'Signed out successfully' });
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
      role: UserRole.BUYER,
      avatar: 'avatar.jpg',
      address: '123 Street',
      phone: '1234567890',
      buyer: {
        id: 'user-123',
      },
    };

    it('should successfully get user profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-123');

      expect(result).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        role: UserRole.BUYER,
        avatar: 'avatar.jpg',
        address: '123 Street',
        phone: '1234567890',
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        relations: ['buyer', 'seller'],
      });
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('user-123')).rejects.toThrow(
        'Failed to get profile: User not found',
      );
    });

    it('should return seller profile data when user is a seller', async () => {
      const mockSellerUser = {
        ...mockUser,
        role: UserRole.SELLER,
        buyer: null,
        seller: {
          id: 'user-123',
          storeName: 'Test Store',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockSellerUser);

      const result = await service.getProfile('user-123');

      expect(result).toMatchObject({
        role: UserRole.SELLER,
        storeName: 'Test Store',
      });
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'mock-refresh-token';
    const mockNewSession = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    };

    it('should successfully refresh token', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: mockNewSession },
        error: null,
      });

      const result = await service.refreshToken(mockRefreshToken);

      expect(result).toEqual({
        session: mockNewSession,
      });

      expect(supabase!.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: mockRefreshToken,
      });
    });

    it('should throw error when refresh token is invalid', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid refresh token' },
      });

      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        'Token refresh failed: Invalid refresh token',
      );
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should send password reset email for existing user', async () => {
      const { supabase } = await import('../../lib/supabase');

      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-123',
        email,
      });

      (supabase!.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await service.forgotPassword(email);

      expect(result).toEqual({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });

      expect(supabase!.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        email,
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        }),
      );
    });

    it('should return success message even when user does not exist (security)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });

      // Should not call Supabase when user doesn't exist
      const { supabase } = await import('../../lib/supabase');
      expect(supabase!.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    });

    it('should throw error when Supabase fails to send email', async () => {
      const { supabase } = await import('../../lib/supabase');

      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-123',
        email,
      });

      (supabase!.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: { message: 'Email service error' },
      });

      await expect(service.forgotPassword(email)).rejects.toThrow(
        'Forgot password failed: Email service error',
      );
    });
  });

  describe('resetPassword', () => {
    const accessToken = 'reset-access-token';
    const newPassword = 'newPassword123';

    it('should successfully reset password', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.updateUser as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      const result = await service.resetPassword(accessToken, newPassword);

      expect(result).toEqual({
        success: true,
        message: 'Password reset successfully',
      });

      expect(supabase!.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword,
      });
    });

    it('should throw error when reset fails', async () => {
      const { supabase } = await import('../../lib/supabase');

      (supabase!.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid or expired token' },
      });

      await expect(
        service.resetPassword(accessToken, newPassword),
      ).rejects.toThrow('Reset password failed: Invalid or expired token');
    });
  });

  describe('changePassword', () => {
    const userId = 'user-123';
    const currentPassword = 'oldPassword123';
    const newPassword = 'newPassword123';

    const mockUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should successfully change password', async () => {
      const { supabase } = await import('../../lib/supabase');
      const { createClient } = await import('@supabase/supabase-js');

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Mock the separate client for password verification
      const mockVerifyClient = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: {
              user: { id: userId },
              session: {},
            },
            error: null,
          }),
        },
      };

      (createClient as jest.Mock).mockReturnValue(mockVerifyClient);

      // Mock password update using Admin API
      (supabase!.auth.admin.updateUserById as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await service.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
      });

      expect(createClient).toHaveBeenCalled();
      expect(mockVerifyClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockUser.email,
        password: currentPassword,
      });

      expect(supabase!.auth.admin.updateUserById).toHaveBeenCalledWith(userId, {
        password: newPassword,
      });
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow('Change password failed: User not found');
    });

    it('should throw error when current password is incorrect', async () => {
      const { createClient } = await import('@supabase/supabase-js');

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Mock the separate client for password verification
      const mockVerifyClient = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid credentials' },
          }),
        },
      };

      (createClient as jest.Mock).mockReturnValue(mockVerifyClient);

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(
        'Change password failed: Current password is incorrect',
      );
    });

    it('should throw error when password update fails', async () => {
      const { supabase } = await import('../../lib/supabase');
      const { createClient } = await import('@supabase/supabase-js');

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Mock the separate client for password verification
      const mockVerifyClient = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: {
              user: { id: userId },
              session: {},
            },
            error: null,
          }),
        },
      };

      (createClient as jest.Mock).mockReturnValue(mockVerifyClient);

      // Mock Admin API update failure
      (supabase!.auth.admin.updateUserById as jest.Mock).mockResolvedValue({
        error: { message: 'Update failed' },
      });

      await expect(
        service.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow('Change password failed: Update failed');
    });
  });

  describe('deleteUser', () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      role: UserRole.BUYER,
      buyer: { id: userId },
    };

    it('should successfully delete a buyer user', async () => {
      const { supabase } = await import('../../lib/supabase');

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (supabase!.auth.admin.deleteUser as jest.Mock).mockResolvedValue({
        error: null,
      });

      mockBuyerRepository.remove.mockResolvedValue(mockUser.buyer);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      const result = await service.deleteUser(userId);

      expect(result).toEqual({
        success: true,
        message:
          'User deleted successfully from both Supabase Auth and database',
      });

      expect(supabase!.auth.admin.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockBuyerRepository.remove).toHaveBeenCalledWith(mockUser.buyer);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should successfully delete a seller user', async () => {
      const { supabase } = await import('../../lib/supabase');

      const mockSellerUser = {
        ...mockUser,
        role: UserRole.SELLER,
        buyer: null,
        seller: { id: userId },
      };

      mockUserRepository.findOne.mockResolvedValue(mockSellerUser);

      (supabase!.auth.admin.deleteUser as jest.Mock).mockResolvedValue({
        error: null,
      });

      mockSellerRepository.remove.mockResolvedValue(mockSellerUser.seller);
      mockUserRepository.remove.mockResolvedValue(mockSellerUser);

      const result = await service.deleteUser(userId);

      expect(result.success).toBe(true);
      expect(mockSellerRepository.remove).toHaveBeenCalledWith(
        mockSellerUser.seller,
      );
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser(userId)).rejects.toThrow(
        'Delete user failed: User not found in database',
      );
    });

    it('should throw error when Supabase deletion fails', async () => {
      const { supabase } = await import('../../lib/supabase');

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (supabase!.auth.admin.deleteUser as jest.Mock).mockResolvedValue({
        error: { message: 'Supabase deletion failed' },
      });

      await expect(service.deleteUser(userId)).rejects.toThrow(
        'Delete user failed: Failed to delete from Supabase Auth: Supabase deletion failed',
      );
    });
  });
});
