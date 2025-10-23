import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRole } from '../lib/supabase';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buyer } from '../account/buyer/entities/buyer.entity';

interface RequestWithUser {
  user: {
    id: string;
  };
}

@Controller('favorites')
@UseGuards(SupabaseAuthGuard, RoleGuard)
@Roles(UserRole.BUYER)
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
  ) {}

  // Helper method để lấy buyerId từ user
  private async getBuyerId(userId: string): Promise<string> {
    const buyer = await this.buyerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!buyer) {
      throw new BadRequestException(
        'Chỉ buyer mới có thể sử dụng tính năng yêu thích',
      );
    }

    return buyer.id;
  }

  // Toggle favorite (thêm/xóa sản phẩm khỏi yêu thích)
  @Post(':productId/toggle')
  async toggleFavorite(
    @Param('productId') productId: number,
    @Request() req: RequestWithUser,
  ) {
    const buyerId = await this.getBuyerId(req.user.id);
    const result = await this.favoriteService.toggleFavorite(
      buyerId,
      productId,
    );
    return {
      message: result.message,
      isFavorite: result.isFavorite,
    };
  }

  // Lấy danh sách yêu thích của user hiện tại
  @Get()
  async getMyFavorites(@Request() req: RequestWithUser) {
    const buyerId = await this.getBuyerId(req.user.id);
    const products = await this.favoriteService.getFavoritesByBuyer(buyerId);
    return {
      message: 'Danh sách sản phẩm yêu thích',
      favorites: products,
    };
  }

  // Kiểm tra sản phẩm có trong yêu thích không
  @Get('check/:productId')
  async checkIsFavorite(
    @Param('productId') productId: number,
    @Request() req: RequestWithUser,
  ) {
    try {
      const buyerId = await this.getBuyerId(req.user.id);
      const isFavorite = await this.favoriteService.isFavorite(
        buyerId,
        productId,
      );
      return { isFavorite };
    } catch {
      // Nếu không phải buyer thì trả về false
      return { isFavorite: false };
    }
  }

  // Lấy số lượng lượt yêu thích của sản phẩm
  @Get('count/:productId')
  async getFavoriteCount(@Param('productId') productId: number) {
    const count = await this.favoriteService.getFavoriteCount(productId);
    return { count };
  }
}
