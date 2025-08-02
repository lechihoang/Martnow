import { Controller, Get, Query, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('products')
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Chỉ seller mới có thể tạo sản phẩm
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }
  // Cả buyer và seller đều có thể xem sản phẩm
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async getProduct(@Param('id') id: number) {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'seller'],
    });
  }

  // Chỉ seller mới có thể cập nhật sản phẩm
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
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
