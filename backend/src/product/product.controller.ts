import { Controller, Get, Query, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
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

  // Lấy danh sách categories
  @Get('categories')
  async getCategories() {
    return this.productService.getCategories();
  }

  // Chỉ seller mới có thể tạo sản phẩm
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async createProduct(@Body() body: any, @Request() req: any) {
    try {
      // Lấy sellerId từ user hiện tại
      const sellerId = await this.productService.getSellerIdByUserId(req.user.userId);
      
      const createProductDto: CreateProductDto = {
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock || 0, // Thêm stock với default là 0
        images: body.images || [],
        sellerId: sellerId,
        categoryId: body.categoryId,
      };

      return this.productService.createProduct(createProductDto);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Cả buyer và seller đều có thể xem sản phẩm
  @Get('top-discount')
  async getTopDiscountProducts() {
    return this.productService.findTopDiscountProducts();
  }

  @Get(':id')
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
    @Request() req: any,
  ) {
    // Lấy sellerId từ user hiện tại
    const sellerId = await this.productService.getSellerIdByUserId(req.user.userId);
    return this.productService.updateProduct(id, updateProductDto, sellerId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  async deleteProduct(@Param('id') id: number, @Request() req: any) {
    // Lấy sellerId từ user hiện tại
    const sellerId = await this.productService.getSellerIdByUserId(req.user.userId);
    return this.productService.deleteProduct(id, sellerId);
  }
}
