import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Seller } from '../account/seller/entities/seller.entity';
import { CreateProductDto, ProductResponseDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MediaService } from '../media/media.service';

export interface ProductFilterOptions {
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class ProductService {
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

  async getSellerIdByUserId(userId: string): Promise<string> {
    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!seller) {
      throw new NotFoundException(`Seller not found for user ID ${userId}`);
    }

    return seller.id;
  }

  async createProduct(
    createProductDto: CreateProductDto,
    sellerId: string,
  ): Promise<ProductResponseDto> {
    const product = this.productRepository.create({
      ...createProductDto,
      sellerId: sellerId,
    });

    const savedProduct = await this.productRepository.save(product);

    const result = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['category', 'seller', 'seller.user'],
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
      relations: ['category', 'seller', 'seller.user'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return new ProductResponseDto(product);
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    sellerId?: string,
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
      relations: ['category', 'seller', 'seller.user'],
    });

    return new ProductResponseDto(updatedProduct!);
  }

  async deleteProduct(
    id: number,
    sellerId?: string,
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

    // Xóa media files trước khi xóa product
    await this.mediaService.deleteAllMediaFiles('product', id.toString());

    await this.productRepository.remove(productEntity);
    return { message: 'Product deleted successfully' };
  }

  // === QUERY METHODS ===

  async findAll(filters: ProductFilterOptions = {}): Promise<{
    products: ProductResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      categoryName,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20, // 20 chia hết cho 2, 4, 5 cột - đảm bảo fill đều các hàng
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
    } = filters;

    console.log('ProductService.findAll called with:', {
      categoryName,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    });

    // Simple approach - get all products first
    const allProducts = await this.productRepository.find({
      relations: ['category', 'seller', 'seller.user'],
    });

    // Apply filters in memory
    let filteredProducts = allProducts;

    if (categoryName) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category?.name === categoryName,
      );
    }

    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);
    }

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const validSortFields = [
      'createdAt',
      'price',
      'averageRating',
      'totalSold',
      'viewCount',
      'name',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    filteredProducts.sort((a, b) => {
      const aValue = a[sortField as keyof Product];
      const bValue = b[sortField as keyof Product];

      if (sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    console.log('Pagination details:', {
      total,
      totalPages,
      page,
      limit,
      startIndex,
      endIndex,
      returnedCount: paginatedProducts.length
    });

    const result = {
      products: paginatedProducts.map(
        (product) => new ProductResponseDto(product),
      ),
      total,
      page: Number(page), // Ensure it's a number
      totalPages,
    };

    console.log('Returning result:', {
      productsCount: result.products.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });

    return result;
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
        product.description ILIKE :likeQuery
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

  async findProductsBySeller(sellerId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .where('product.sellerId = :sellerId', { sellerId })
      .getMany();

    return products.map((product) => new ProductResponseDto(product));
  }

  async validateSellerOwnership(
    productId: number,
    sellerId: string,
  ): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId, sellerId },
    });
    return !!product;
  }
}
