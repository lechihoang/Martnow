import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserActivityService } from './user-activity.service';

@Controller('user-activity')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  // Lấy tất cả reviews của user
  @Get('user/:userId/reviews')
  async getUserReviews(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userActivityService.getUserReviews(userId);
  }

  // Lấy tất cả đơn hàng của user (role buyer)
  @Get('user/:userId/orders')
  async getUserOrders(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userActivityService.getUserOrders(userId);
  }

  // Giữ lại endpoint cũ để backward compatibility (deprecated)
  @Get('buyer/:buyerId/orders')
  async getBuyerOrders(@Param('buyerId', ParseIntPipe) buyerId: number) {
    // Tìm user từ buyerId
    console.warn(
      'Deprecated endpoint: /buyer/:buyerId/orders. Use /user/:userId/orders instead.',
    );
    return {
      message: 'This endpoint is deprecated. Use /user/:userId/orders instead.',
    };
  }

  // Lấy tất cả đơn hàng mà user (role seller) đã bán
  @Get('user/:userId/sales')
  async getUserSales(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userActivityService.getUserSales(userId);
  }

  // Giữ lại endpoint cũ cho seller (deprecated)
  @Get('seller/:sellerId/orders')
  async getSellerOrders(@Param('sellerId', ParseIntPipe) sellerId: number) {
    console.warn(
      'Deprecated endpoint: /seller/:sellerId/orders. Use /user/:userId/sales instead.',
    );
    return await this.userActivityService.getSellerOrders(sellerId);
  }

  // Lấy thông tin profile đầy đủ của user
  @Get('user/:userId/profile')
  async getUserProfile(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userActivityService.getUserProfile(userId);
  }
}
