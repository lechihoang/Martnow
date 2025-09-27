import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../lib/supabase';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
