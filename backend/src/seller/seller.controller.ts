import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto, UpdateSellerDto } from '../user/dto/seller.dto';

@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  // Tạo seller profile mới
  @Post()
  async createSeller(@Body() sellerData: CreateSellerDto) {
    return await this.sellerService.createSeller(sellerData);
  }

  // Lấy thông tin seller theo ID
  @Get(':id')
  async getSeller(@Param('id', ParseIntPipe) sellerId: number) {
    return await this.sellerService.findOne(sellerId);
  }

  // Lấy thông tin seller theo User ID
  @Get('by-user/:userId')
  async getSellerByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.sellerService.findByUserId(userId);
  }

  // Cập nhật thông tin seller
  @Patch(':id')
  async updateSeller(
    @Param('id', ParseIntPipe) sellerId: number,
    @Body() sellerData: UpdateSellerDto
  ) {
    return await this.sellerService.updateSeller(sellerId, sellerData);
  }

  // Lấy tất cả đơn hàng mà seller đã bán
  @Get(':sellerId/orders')
  async getSellerOrders(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return await this.sellerService.getSellerOrders(sellerId);
  }
}
 