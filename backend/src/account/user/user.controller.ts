import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get user profile by ID (public endpoint)
   */
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.userService.findByIdWithRelations(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return new UserResponseDto(user);
  }

  /**
   * Update user profile (only the user themselves can update)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    // Check if user is updating their own profile
    if (req.user.id !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    return await this.userService.updateUser(id, updateUserDto);
  }

  /**
   * Delete user account (only the user themselves can delete)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ message: string }> {
    // Check if user is deleting their own account
    if (req.user.id !== id) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    return await this.userService.deleteUser(id);
  }
}
