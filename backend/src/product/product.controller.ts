import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';

@Controller('products')
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Get()
  async getProductsByCategory(@Query('categoryId') categoryId: number) {
    if (!categoryId) return [];
    return this.productRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category', 'seller'],
    });
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
