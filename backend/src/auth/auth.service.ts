import { Injectable } from '@nestjs/common';
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
      throw new Error(`Signup failed: ${(error as Error).message}`);
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
      throw new Error(`Signin failed: ${(error as Error).message}`);
    }
  }

  signout(userId: string) {
    // Backend is stateless - signout is handled client-side by removing token
    // The client will delete their access_token and refresh_token from local storage
    // No server-side action is needed as JWT tokens are validated on each request

    // Log the signout for audit purposes (optional)
    console.log(`User ${userId} initiated signout`);

    // Return success - actual token removal happens client-side
    return { message: 'Signed out successfully' };
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

      if (user.role === UserRole.BUYER && user.buyer) {
        profileData = { ...profileData, ...user.buyer };
      } else if (user.role === UserRole.SELLER && user.seller) {
        profileData = { ...profileData, ...user.seller };
      }

      return profileData;
    } catch (error) {
      throw new Error(`Failed to get profile: ${(error as Error).message}`);
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
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
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
      throw new Error(`Delete user failed: ${(error as Error).message}`);
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
        throw new Error((error as Error).message);
      }

      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    } catch (error) {
      throw new Error(`Forgot password failed: ${(error as Error).message}`);
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
      throw new Error(`Reset password failed: ${(error as Error).message}`);
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

      // 2. Verify current password using a separate client instance
      // This prevents affecting the current user's session
      const { createClient } = await import('@supabase/supabase-js');
      const verifyClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
      );

      const { error: verifyError } = await verifyClient.auth.signInWithPassword(
        {
          email: user.email,
          password: currentPassword,
        },
      );

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // 3. Update password using Admin API (doesn't require current password)
      // This ensures we don't create unnecessary sessions
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword },
      );

      if (updateError) {
        throw new Error(updateError.message);
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new Error(`Change password failed: ${(error as Error).message}`);
    }
  }
}
