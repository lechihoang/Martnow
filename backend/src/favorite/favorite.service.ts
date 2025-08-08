import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../user/entities/favorite.entity';
import { Buyer } from '../user/entities/buyer.entity';
import { Product } from '../product/entities/product.entity';
import { ProductResponseDto } from '../product/dto/create-product.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  // Thêm sản phẩm vào danh sách yêu thích
  async addToFavorites(buyerId: number, productId: number): Promise<Favorite> {
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { buyerId, productId },
    });

    if (existingFavorite) {
      throw new Error('Sản phẩm đã có trong danh sách yêu thích');
    }

    const favorite = this.favoriteRepository.create({
      buyerId,
      productId,
    });

    return this.favoriteRepository.save(favorite);
  }

  // Xóa sản phẩm khỏi danh sách yêu thích
  async removeFromFavorites(buyerId: number, productId: number): Promise<void> {
    const result = await this.favoriteRepository.delete({
      buyerId,
      productId,
    });

    if (result.affected === 0) {
      throw new Error('Sản phẩm không có trong danh sách yêu thích');
    }
  }

  // Lấy danh sách sản phẩm yêu thích của user
  async getFavoritesByBuyer(buyerId: number): Promise<ProductResponseDto[]> {
    const favorites = await this.favoriteRepository.find({
      where: { buyerId },
      relations: [
        'product', 
        'product.images', 
        'product.seller', 
        'product.seller.user',
        'product.category'
      ],
    });

    // Convert to ProductResponseDto array
    return favorites.map(favorite => new ProductResponseDto(favorite.product));
  }

  // Kiểm tra sản phẩm có trong danh sách yêu thích không
  async isFavorite(buyerId: number, productId: number): Promise<boolean> {
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
