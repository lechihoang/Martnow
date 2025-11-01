import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RoleGuard } from '../../auth/role.guard';
import { Roles } from '../../auth/role.decorator';
import { UserRole } from '../../lib/supabase';

// Decorator to mark routes as public (skip authentication)
export const Public = () => SetMetadata('isPublic', true);

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body()
    createUserDto: {
      id: string;
      email: string;
      name: string;
      username: string;
      role: UserRole;
    },
  ) {
    return this.userService.create(createUserDto);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findByIdWithRelations(id);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      message: 'User retrieved successfully',
      data: new UserResponseDto(user),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  @Delete(':id')
  @Roles(UserRole.SELLER)
  @UseGuards(RoleGuard)
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
