import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { supabase, UserRole } from '../lib/supabase';
import { User } from '../account/user/entities/user.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { Seller } from '../account/seller/entities/seller.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
  ) {}

  async signup(signupDto: {
    email: string;
    password: string;
    name?: string;
    username?: string;
  }) {
    try {
      // 1. Create user in Supabase Auth
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupDto.email,
        password: signupDto.password,
        options: {
          data: {
            name: signupDto.name || 'User',
            username: signupDto.username || `user_${Date.now()}`,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // 2. Create user profile in database
      const user = this.userRepository.create({
        id: authData.user.id,
        email: signupDto.email,
        name: signupDto.name || 'User',
        username: signupDto.username || `user_${Date.now()}`,
        role: UserRole.BUYER, // Default role
      });

      await this.userRepository.save(user);

      // 3. Create buyer profile
      const buyer = this.buyerRepository.create({
        id: authData.user.id,
      });

      await this.buyerRepository.save(buyer);

      // 4. Return auth data
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        },
        session: authData.session,
      };
    } catch (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }

  async signin(signinDto: { email: string; password: string }) {
    try {
      // 1. Sign in with Supabase Auth
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: signinDto.email,
          password: signinDto.password,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Invalid credentials');
      }

      // 2. Get user profile from database
      const user = await this.userRepository.findOne({
        where: { id: authData.user.id },
      });

      if (!user) {
        throw new Error('User profile not found');
      }

      // 3. Return auth data
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        },
        session: authData.session,
      };
    } catch (error) {
      throw new Error(`Signin failed: ${error.message}`);
    }
  }

  async signout(userId: string) {
    try {
      // 1. Sign out from Supabase Auth
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return { message: 'Signed out successfully' };
    } catch (error) {
      throw new Error(`Signout failed: ${error.message}`);
    }
  }

  async getProfile(userId: string) {
    try {
      // 1. Get user profile from database
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['buyer', 'seller'],
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Get additional profile data based on role
      let profileData = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        phone: user.phone,
      };

      if (user.role === 'BUYER' && user.buyer) {
        profileData = { ...profileData, ...user.buyer };
      } else if (user.role === 'SELLER' && user.seller) {
        profileData = { ...profileData, ...user.seller };
      }

      return profileData;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. Refresh token with Supabase
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data: authData, error: authError } =
        await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.session) {
        throw new Error('Failed to refresh token');
      }

      return {
        session: authData.session,
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async deleteUser(userId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // 1. Get user from database first
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['buyer', 'seller'],
      });

      if (!user) {
        throw new Error('User not found in database');
      }

      // 2. Delete from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        throw new Error(
          `Failed to delete from Supabase Auth: ${authError.message}`,
        );
      }

      // 3. Delete related profiles first (due to foreign key constraints)
      if (user.role === UserRole.BUYER && user.buyer) {
        await this.buyerRepository.remove(user.buyer);
      } else if (user.role === UserRole.SELLER && user.seller) {
        await this.sellerRepository.remove(user.seller);
      }

      // 4. Delete user profile from database
      await this.userRepository.remove(user);

      return {
        success: true,
        message:
          'User deleted successfully from both Supabase Auth and database',
      };
    } catch (error) {
      throw new Error(`Delete user failed: ${error.message}`);
    }
  }

  async forgotPassword(email: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // 1. Check if user exists in database
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists for security reasons
        return {
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        };
      }

      // 2. Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    } catch (error) {
      throw new Error(`Forgot password failed: ${error.message}`);
    }
  }

  async resetPassword(accessToken: string, newPassword: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // 1. Update password using the access token from reset link
      const { data: authData, error: authError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to reset password');
      }

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new Error(`Reset password failed: ${error.message}`);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // 1. Get user from database
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // 3. Update password
      const { data: authData, error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to change password');
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new Error(`Change password failed: ${error.message}`);
    }
  }
}
