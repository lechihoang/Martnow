import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRole } from '../lib/supabase';

// Decorator to mark routes as public (skip authentication)
export const Public = () => SetMetadata('isPublic', true);

@Controller('product') // Đổi từ 'products' thành 'product' để match với app.module.ts
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // === BASIC CRUD ENDPOINTS ===

  @Get()
  async getProducts(
    @Query('categoryName') categoryName?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('search') search?: string,
  ) {
    // Parse and validate parameters
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 20; // 20 chia hết cho 2, 4, 5 cột
    const parsedMinPrice = minPrice ? parseFloat(minPrice) : undefined;
    const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : undefined;

    console.log('Product query params:', {
      page: parsedPage,
      limit: parsedLimit,
      categoryName,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      sortBy,
      sortOrder,
      search,
    });

    return this.productService.findAll({
      categoryName,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      page: parsedPage,
      limit: parsedLimit,
      sortBy,
      sortOrder,
      search,
    });
  }

  @Get('popular')
  async getPopularProducts(@Query('limit') limit: number = 10) {
    return this.productService.getPopularProducts(limit);
  }

  @Get('seller')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.SELLER)
  async getSellerProducts(@Request() req: { user: { id: string } }) {
    const sellerId = await this.productService.getSellerIdByUserId(req.user.id);
    return this.productService.findProductsBySeller(sellerId);
  }

  @Get(':id')
  async getProduct(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @Public()
  @Get('seller/:sellerId')
  async getProductsBySeller(@Param('sellerId') sellerId: string) {
    return this.productService.findProductsBySeller(sellerId);
  }

  // === SELLER ONLY ENDPOINTS ===

  @Post()
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.SELLER)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Request() req: { user: { id: string } },
  ) {
    const sellerId = await this.productService.getSellerIdByUserId(req.user.id);
    return this.productService.createProduct(createProductDto, sellerId);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.SELLER)
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: { user: { id: string } },
  ) {
    const sellerId = await this.productService.getSellerIdByUserId(req.user.id);
    return this.productService.updateProduct(id, updateProductDto, sellerId);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.SELLER)
  async deleteProduct(
    @Param('id') id: number,
    @Request() req: { user: { id: string } },
  ) {
    const sellerId = await this.productService.getSellerIdByUserId(req.user.id);
    return this.productService.deleteProduct(id, sellerId);
  }
}
