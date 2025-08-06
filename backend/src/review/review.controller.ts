import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Tạo review mới - chỉ buyer mới được review
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    // Lấy buyerId từ user hiện tại
    const buyerId = req.user.buyerId; // Cần add buyerId vào JWT payload
    
    const reviewData = {
      ...createReviewDto,
      buyerId
    };

    return this.reviewService.createReview(reviewData);
  }

  // Lấy tất cả reviews của một sản phẩm
  @Get('product/:productId')
  async getProductReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewService.getProductReviews(productId);
  }

  // Lấy thống kê rating của sản phẩm
  @Get('product/:productId/stats')
  async getProductRatingStats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewService.getProductRatingStats(productId);
  }

  // Cập nhật review - chỉ chủ review mới được sửa
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req
  ) {
    const buyerId = req.user.buyerId;
    return this.reviewService.updateReview(id, updateReviewDto, buyerId);
  }

  // Xóa review - chỉ chủ review mới được xóa
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async deleteReview(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const buyerId = req.user.buyerId;
    await this.reviewService.deleteReview(id, buyerId);
    return { message: 'Xóa đánh giá thành công' };
  }
}
