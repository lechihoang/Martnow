import { Controller, Post, Delete, Get, Param, ParseIntPipe, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buyer } from '../user/entities/buyer.entity';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
  ) {}

  // Helper method để lấy buyerId từ user
  private async getBuyerId(userId: number): Promise<number> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
    });
    
    if (!buyer) {
      throw new BadRequestException('Chỉ buyer mới có thể sử dụng tính năng yêu thích');
    }
    
    return buyer.id;
  }

  // Thêm sản phẩm vào yêu thích
  @Post(':productId')
  async addToFavorites(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: any,
  ) {
    const buyerId = await this.getBuyerId(req.user.userId);
    const favorite = await this.favoriteService.addToFavorites(buyerId, productId);
    return {
      message: 'Đã thêm vào danh sách yêu thích',
      data: favorite,
    };
  }

  // Xóa sản phẩm khỏi yêu thích
  @Delete(':productId')
  async removeFromFavorites(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: any,
  ) {
    const buyerId = await this.getBuyerId(req.user.userId);
    await this.favoriteService.removeFromFavorites(buyerId, productId);
    return {
      message: 'Đã xóa khỏi danh sách yêu thích',
    };
  }

  // Lấy danh sách yêu thích của user hiện tại
  @Get()
  async getMyFavorites(@Request() req: any) {
    const buyerId = await this.getBuyerId(req.user.userId);
    const products = await this.favoriteService.getFavoritesByBuyer(buyerId);
    return {
      message: 'Danh sách sản phẩm yêu thích',
      data: products,
    };
  }

  // Kiểm tra sản phẩm có trong yêu thích không
  @Get('check/:productId')
  async checkIsFavorite(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: any,
  ) {
    try {
      const buyerId = await this.getBuyerId(req.user.userId);
      const isFavorite = await this.favoriteService.isFavorite(buyerId, productId);
      return { isFavorite };
    } catch (error) {
      // Nếu không phải buyer thì trả về false
      return { isFavorite: false };
    }
  }

  // Lấy số lượng lượt yêu thích của sản phẩm
  @Get('count/:productId')
  async getFavoriteCount(@Param('productId', ParseIntPipe) productId: number) {
    const count = await this.favoriteService.getFavoriteCount(productId);
    return { count };
  }
}
