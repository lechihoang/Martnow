import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';

@Controller('products')
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Post()
  async createProduct(@Body() productData: Partial<Product>) {
    const product = this.productRepository.create(productData);
    return await this.productRepository.save(product);
  }

  @Get()
  async getProducts(
    @Query('categoryId') categoryId?: number,
    @Query('type') type?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller');

    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
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

    return query.getMany();
  }

  @Get('top-discount')
  async getTopDiscountProducts() {
    return this.productRepository.find({
      order: { discount: 'DESC' },
      take: 10,
      relations: ['category', 'seller'],
    });
  }
}
