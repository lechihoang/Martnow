import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { Product } from '../product/entities/product.entity';
import { ProductResponseDto } from '../product/dto/create-product.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  // Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích (toggle)
  async toggleFavorite(
    buyerId: string,
    productId: number,
  ): Promise<{ isFavorite: boolean; message: string }> {
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { buyerId, productId },
    });

    if (existingFavorite) {
      await this.favoriteRepository.remove(existingFavorite);
      return { isFavorite: false, message: 'Đã xóa khỏi danh sách yêu thích' };
    } else {
      const favorite = this.favoriteRepository.create({
        buyerId,
        productId,
      });
      await this.favoriteRepository.save(favorite);
      return { isFavorite: true, message: 'Đã thêm vào danh sách yêu thích' };
    }
  }

  // Lấy danh sách sản phẩm yêu thích của user
  async getFavoritesByBuyer(buyerId: string): Promise<ProductResponseDto[]> {
    const favorites = await this.favoriteRepository.find({
      where: { buyerId },
      relations: [
        'product',
        'product.seller',
        'product.seller.user',
        'product.category',
      ],
    });

    return favorites.map(
      (favorite) => new ProductResponseDto(favorite.product),
    );
  }

  // Kiểm tra sản phẩm có trong danh sách yêu thích không
  async isFavorite(buyerId: string, productId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { buyerId, productId },
    });
    return !!favorite;
  }

  // Lấy số lượng lượt yêu thích của sản phẩm
  async getFavoriteCount(productId: number): Promise<number> {
    return this.favoriteRepository.count({
      where: { productId },
    });
  }
}
