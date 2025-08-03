import { Controller, Get, Query, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Chỉ seller mới có thể tạo sản phẩm
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  // Cả buyer và seller đều có thể xem sản phẩm
  @Get('top-discount')
  async getTopDiscountProducts() {
    return this.productService.findTopDiscountProducts();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async getProduct(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @Get()
  async getProducts(
    @Query('categoryId') categoryId?: number,
    @Query('sellerId') sellerId?: number,
    @Query('type') type?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.productService.findAll({ categoryId, sellerId, type, minPrice, maxPrice });
  }

  // Lấy products của một seller cụ thể
  @Get('seller/:sellerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async getProductsBySeller(@Param('sellerId') sellerId: number) {
    return this.productService.findAll({ sellerId });
  }

  // Chỉ seller mới có thể cập nhật sản phẩm
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async deleteProduct(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }
}
