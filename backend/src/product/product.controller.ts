import { Controller, Get, Query, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }
  @Get(':id')
  async getProduct(@Param('id') id: number) {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'seller'],
    });
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    await this.productRepository.update(id, updateProductDto);
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'seller'],
    });
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    await this.productRepository.delete(id);
    return { message: 'Product deleted' };
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
