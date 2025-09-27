import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CartCheckoutDto } from './dto/order.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRole } from '../lib/supabase';

@Controller('order') // Đổi từ 'orders' thành 'order' để match với app.module.ts
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ========== CART CHECKOUT ENDPOINTS ==========

  /**
   * Checkout giỏ hàng thành đơn hàng
   */
  @Post('checkout') // Đổi từ 'cart/checkout' thành 'checkout'
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER)
  async checkoutCart(
    @Body() cartCheckoutDto: CartCheckoutDto,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.id;
      console.log('🛒 Checkout cart request:', {
        userId,
        items: cartCheckoutDto.items,
      });

      const result = await this.orderService.checkoutCart(
        cartCheckoutDto,
        userId,
      );

      console.log('✅ Checkout successful:', result);
      return {
        message: 'Checkout successful',
        data: result,
      };
    } catch (error) {
      console.error('❌ Checkout failed:', error);
      throw new HttpException(
        error.message || 'Checkout failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Hủy đơn hàng từ cart checkout
   */
  @Delete('cancel/:orderId')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER)
  async cancelOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: any,
  ) {
    try {
      const userId = req.user.id;
      console.log('❌ Cancel order request:', { orderId, userId });

      const result = await this.orderService.cancelOrder(orderId, userId);

      console.log('✅ Order cancelled:', result);
      return {
        message: 'Order cancelled successfully',
        data: result,
      };
    } catch (error) {
      console.error('❌ Cancel order failed:', error);
      throw new HttpException(
        error.message || 'Cancel order failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ========== ORDER QUERY ENDPOINTS ==========

  /**
   * Lấy đơn hàng theo ID
   */
  @Get(':orderId')
  @UseGuards(SupabaseAuthGuard)
  async getOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: any,
  ) {
    try {
      console.log('🔍 Get order request:', { orderId, userId: req.user.id });

      const order = await this.orderService.getOrderById(orderId, req.user.id);

      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      console.log('✅ Order retrieved:', order);
      return {
        message: 'Order retrieved successfully',
        data: order,
      };
    } catch (error) {
      console.error('❌ Get order failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Get order failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy tất cả đơn hàng của user
   */
  @Get('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  async getUserOrders(@Param('userId') userId: string, @Req() req: any) {
    try {
      // Kiểm tra user chỉ có thể xem đơn hàng của mình
      if (req.user.id !== userId) {
        throw new HttpException(
          'Unauthorized: Can only view your own orders',
          HttpStatus.FORBIDDEN,
        );
      }

      console.log('🔍 Get user orders request:', { userId });

      const orders = await this.orderService.getOrdersByUser(userId);

      console.log('✅ User orders retrieved:', { count: orders.length });
      return {
        message: 'User orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      console.error('❌ Get user orders failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Get user orders failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ========== SELLER TRACKING ENDPOINTS ==========

  /**
   * Lấy đơn hàng của seller (chỉ hiển thị items của seller đó)
   */
  @Get('seller/:sellerId')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.SELLER)
  async getSellerOrders(@Param('sellerId') sellerId: string, @Req() req: any) {
    try {
      // Kiểm tra seller chỉ có thể xem đơn hàng của mình
      if (req.user.id !== sellerId) {
        throw new HttpException(
          'Unauthorized: Can only view your own orders',
          HttpStatus.FORBIDDEN,
        );
      }

      console.log('🔍 Get seller orders request:', { sellerId });

      const orders = await this.orderService.getOrdersBySeller(sellerId);

      console.log('✅ Seller orders retrieved:', { count: orders.length });
      return {
        message: 'Seller orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      console.error('❌ Get seller orders failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Get seller orders failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xuất báo cáo doanh thu và gửi qua email
   */
  @Post('seller/export-revenue-report')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.SELLER)
  async exportRevenueReport(@Req() req: any) {
    try {
      const sellerId = req.user.id;
      const sellerEmail = req.user.email;

      console.log('📊 Export revenue report request:', { sellerId, sellerEmail });

      // Generate and send revenue report
      const result = await this.orderService.generateAndEmailRevenueReport(
        sellerId,
        sellerEmail,
      );

      console.log('✅ Revenue report sent:', result);
      return {
        message: 'Báo cáo doanh thu đã được gửi đến email của bạn',
        data: result,
      };
    } catch (error) {
      console.error('❌ Export revenue report failed:', error);
      throw new HttpException(
        error.message || 'Failed to export revenue report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ========== HEALTH CHECK ENDPOINT ==========

  /**
   * Health check endpoint để test module
   */
  @Get('health')
  async healthCheck() {
    return {
      message: 'Order module is healthy',
      timestamp: new Date().toISOString(),
      status: 'OK',
    };
  }
}
