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

  // Lấy tất cả đơn hàng của buyer
  @Get('buyer/:buyerId/orders')
  async getBuyerOrders(@Param('buyerId', ParseIntPipe) buyerId: number) {
    return await this.userActivityService.getBuyerOrders(buyerId);
  }

  // Lấy tất cả đơn hàng mà seller đã bán
  @Get('seller/:sellerId/orders')
  async getSellerOrders(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return await this.userActivityService.getSellerOrders(sellerId);
  }

  // Lấy thông tin profile đầy đủ của user
  @Get('user/:userId/profile')
  async getUserProfile(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userActivityService.getUserProfile(userId);
  }
}
