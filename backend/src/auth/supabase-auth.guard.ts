import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { supabase } from '../lib/supabase';
import { DataSource } from 'typeorm';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    profile?: unknown;
  };
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(@Inject(DataSource) private dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    console.log('🔐 SupabaseAuthGuard - Request URL:', request.url);
    console.log('🔐 SupabaseAuthGuard - Request method:', request.method);
    console.log(
      '🔐 SupabaseAuthGuard - Token extracted:',
      token ? `${token.substring(0, 20)}...` : 'No token',
    );

    if (!token) {
      console.error('❌ No token provided for', request.url);
      throw new UnauthorizedException('No token provided');
    }

    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      throw new UnauthorizedException('Supabase client not initialized');
    }

    try {
      console.log('🔍 Verifying JWT token with Supabase...');

      // Verify JWT token with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error) {
        console.error('❌ Supabase auth error:', error.message);
        throw new UnauthorizedException('Invalid token: ' + error.message);
      }

      if (!user) {
        console.error('❌ No user found in token');
        throw new UnauthorizedException('Invalid token: No user found');
      }

      console.log('✅ Token verified successfully');
      console.log('👤 User ID:', user.id);
      console.log('📧 User email:', user.email);

      // Load user profile from database
      const userRepository = this.dataSource.getRepository('User');
      const userProfile = await userRepository.findOne({
        where: { id: user.id },
      });

      if (userProfile) {
        console.log('👤 User profile loaded from database');
        console.log('👤 User role:', (userProfile as { role: string }).role);
      } else {
        console.warn('⚠️ User profile not found in database for ID:', user.id);
      }

      // Attach user info to request
      request.user = {
        id: user.id,
        email: user.email ?? undefined,
        user_metadata: user.user_metadata,
        profile: userProfile,
      };

      console.log('✅ Authentication successful for user:', user.id);

      return true;
    } catch (error) {
      console.error(
        '❌ Authentication failed for',
        request.url,
        ':',
        (error as Error).message,
      );
      throw new UnauthorizedException(
        'Authentication failed: ' + (error as Error).message,
      );
    }
  }

  private extractTokenFromHeader(request: RequestWithUser): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
