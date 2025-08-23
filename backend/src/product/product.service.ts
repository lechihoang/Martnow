import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Seller } from '../account/seller/entities/seller.entity';
import { CreateProductDto, ProductResponseDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MediaService } from '../media/media.service';
import * as slug from 'slug';

export interface ProductFilterOptions {
  categoryId?: number;
  sellerId?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class ProductService {
  private readonly productRelations = ['category', 'seller', 'seller.user'];

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly mediaService: MediaService,
  ) {}

  // === BASIC CRUD METHODS ===

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async getSellerIdByUserId(userId: string): Promise<number> {
    const seller = await this.sellerRepository.findOne({
      where: { user: { id: parseInt(userId) } },
      relations: ['user'],
    });

    if (!seller) {
      throw new NotFoundException(`Seller not found for user ID ${userId}`);
    }

    return seller.id;
  }

  async createProduct(
    createProductDto: CreateProductDto,
    sellerId: number,
  ): Promise<ProductResponseDto> {
    const product = this.productRepository.create({
      ...createProductDto,
      sellerId: sellerId,
      categoryId: createProductDto.categoryId,
    });

    const savedProduct = await this.productRepository.save(product);

    const result = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: this.productRelations,
    });

    if (!result) {
      throw new NotFoundException(
        `Product with ID ${savedProduct.id} not found after creation`,
      );
    }

    return new ProductResponseDto(result);
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: this.productRelations,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Increment view count asynchronously (fire and forget)
    this.incrementViewCount(id).catch((err) =>
      console.error('Failed to increment view count:', err),
    );

    return new ProductResponseDto(product);
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    sellerId?: number,
  ): Promise<ProductResponseDto> {
    const productEntity = await this.productRepository.findOne({
      where: { id },
    });
    if (!productEntity) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu nếu sellerId được cung cấp
    if (sellerId !== undefined && productEntity.sellerId !== sellerId) {
      throw new NotFoundException(
        `Product with ID ${id} not found or you don't have permission to update it`,
      );
    }

    await this.productRepository.update(id, updateProductDto);

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: this.productRelations,
    });

    return new ProductResponseDto(updatedProduct!);
  }

  async deleteProduct(
    id: number,
    sellerId?: number,
  ): Promise<{ message: string }> {
    const productEntity = await this.productRepository.findOne({
      where: { id },
    });
    if (!productEntity) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Kiểm tra quyền sở hữu nếu sellerId được cung cấp
    if (sellerId !== undefined && productEntity.sellerId !== sellerId) {
      throw new NotFoundException(
        `Product with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    // ✅ MANUAL CLEANUP: Delete media files trước khi xóa product
    await this.mediaService.deleteAllMediaFiles('product', id);

    // Delete product từ database
    await this.productRepository.delete(id);

    return {
      message: 'Product and associated media files deleted successfully',
    };
  }

  // === QUERY METHODS ===

  async findAll(
    filters: ProductFilterOptions = {},
  ): Promise<ProductResponseDto[]> {
    const { categoryId, sellerId, type, minPrice, maxPrice } = filters;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user');

    this.applyFilters(query, {
      categoryId,
      sellerId,
      type,
      minPrice,
      maxPrice,
    });

    const products = await query.getMany();
    return products.map((product) => new ProductResponseDto(product));
  }

  async searchProducts(
    searchQuery: string,
    limit: number = 20,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .where('product.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere(
        `(
        product.name ILIKE :likeQuery OR
        product.description ILIKE :likeQuery OR
        product.tags ILIKE :likeQuery
      )`,
        {
          likeQuery: `%${searchQuery}%`,
        },
      )
      .orderBy('product.totalSold', 'DESC')
      .addOrderBy('product.averageRating', 'DESC')
      .limit(limit)
      .getMany();

    return products.map((product) => new ProductResponseDto(product));
  }

  async getPopularProducts(limit: number = 10): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .where('product.isAvailable = :isAvailable', { isAvailable: true })
      .orderBy('product.totalSold', 'DESC')
      .addOrderBy('product.averageRating', 'DESC')
      .addOrderBy('product.viewCount', 'DESC')
      .limit(limit)
      .getMany();

    return products.map((product) => new ProductResponseDto(product));
  }

  async findTopDiscountProducts(
    limit: number = 10,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .orderBy('product.discount', 'DESC')
      .take(limit)
      .getMany();

    return products.map((product) => new ProductResponseDto(product));
  }

  async getSimilarProducts(
    productId: number,
    limit: number = 5,
  ): Promise<ProductResponseDto[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category'],
    });

    if (!product) return [];

    const similar = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .where('product.categoryId = :categoryId', {
        categoryId: product.categoryId,
      })
      .andWhere('product.id != :productId', { productId })
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true })
      .orderBy('product.averageRating', 'DESC')
      .addOrderBy('product.totalSold', 'DESC')
      .limit(limit)
      .getMany();

    return similar.map((p) => new ProductResponseDto(p));
  }

  // === UTILITY METHODS ===

  async validateSellerOwnership(
    productId: number,
    sellerId: number,
  ): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId, sellerId },
    });
    return !!product;
  }

  async findProductsBySeller(sellerId: number): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .where('product.sellerId = :sellerId', { sellerId })
      .getMany();

    return products.map((product) => new ProductResponseDto(product));
  }

  async incrementViewCount(productId: number): Promise<void> {
    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set({ viewCount: () => 'viewCount + 1' })
      .where('id = :id', { id: productId })
      .execute();
  }

  async updateProductStatistics(productId: number): Promise<void> {
    const [reviewStats, salesStats] = await Promise.all([
      // Get review statistics
      this.productRepository.query(
        `
        SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
        FROM review WHERE productId = $1
      `,
        [productId],
      ),

      // Get sales statistics
      this.productRepository.query(
        `
        SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
        FROM order_item oi 
        JOIN "order" o ON oi.orderId = o.id 
        WHERE oi.productId = $1 AND o.status = 'đã thanh toán'
      `,
        [productId],
      ),
    ]);

    const avgRating = reviewStats[0]?.avg_rating || 0;
    const totalReviews = reviewStats[0]?.total_reviews || 0;
    const totalSold = salesStats[0]?.total_sold || 0;

    await this.productRepository.update(productId, {
      averageRating: parseFloat(avgRating),
      totalReviews: totalReviews,
      totalSold: totalSold,
    });
  }

  generateProductSlug(name: string): string {
    return slug(name, { lower: true });
  }

  private applyFilters(query: any, filters: ProductFilterOptions): void {
    const { categoryId, sellerId, type, minPrice, maxPrice } = filters;

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (sellerId) {
      query.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    if (type) {
      query.andWhere('product.type = :type', { type });
    }

    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }
  }
}
