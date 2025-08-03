import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductFilterOptions {
  categoryId?: number;
  sellerId?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class ProductService {
  private readonly productRelations = ['category', 'seller'];

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Tạo product chỉ với các ID, không cần load toàn bộ entity
    const product = this.productRepository.create({
      ...createProductDto,
      sellerId: createProductDto.sellerId,
      categoryId: createProductDto.categoryId,
    });
    
    const savedProduct = await this.productRepository.save(product);
    
    // Chỉ load relations khi cần trả về đầy đủ thông tin
    const result = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: this.productRelations,
    });
    
    if (!result) {
      throw new NotFoundException(`Product with ID ${savedProduct.id} not found after creation`);
    }
    
    return result;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: this.productRelations,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id); // Kiểm tra product có tồn tại không
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Kiểm tra product có tồn tại không
    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  async findAll(filters: ProductFilterOptions = {}): Promise<Product[]> {
    const { categoryId, type, minPrice, maxPrice } = filters;
    
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller');

    this.applyFilters(query, { categoryId, type, minPrice, maxPrice });

    return query.getMany();
  }

  async findTopDiscountProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      order: { discount: 'DESC' },
      take: limit,
      relations: this.productRelations,
    });
  }

  // Kiểm tra xem product có thuộc về seller không
  async validateSellerOwnership(productId: number, sellerId: number): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId, sellerId },
    });
    return !!product;
  }

  // Lấy tất cả products của một seller (không cần relations để tối ưu)
  async findProductsBySeller(sellerId: number, withRelations: boolean = false): Promise<Product[]> {
    const options: any = {
      where: { sellerId },
    };

    if (withRelations) {
      options.relations = this.productRelations;
    }

    return this.productRepository.find(options);
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
