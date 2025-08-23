import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CartService, CartCheckoutDto } from './cart.service';
import { PaymentService } from '../payment/payment.service';
import { OrderBusinessService } from '../order/order-business.service';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly paymentService: PaymentService,
    private readonly orderBusinessService: OrderBusinessService,
  ) {}

  /**
   * Checkout cart với multiple sellers
   * Tạo multiple orders nếu có nhiều sellers
   */
  @Post('checkout')
  @Roles(UserRole.BUYER)
  async checkoutCart(@Body() cartCheckoutDto: CartCheckoutDto, @Req() req: any) {
    try {
      const userId = req.user.userId;

      // 1. Checkout cart - tạo multiple orders
      const checkoutResult = await this.cartService.checkoutCart(
        cartCheckoutDto,
        userId,
      );

      // 2. Tạo payment URLs cho tất cả orders
      const paymentInfos = await Promise.all(
        checkoutResult.orders.map(async (order) => {
          const paymentUrl = await this.paymentService.createPaymentUrl(
            order.id,
            order.totalPrice,
          );
          return {
            orderId: order.id,
            amount: order.totalPrice,
            paymentUrl,
          };
        }),
      );

      return {
        success: true,
        message: 'Cart checkout completed successfully',
        data: {
          orders: checkoutResult.orders.map((order) => ({
            id: order.id,
            totalPrice: order.totalPrice,
            status: order.status,
            note: order.note,
          })),
          totalAmount: checkoutResult.totalAmount,
          sellerCount: checkoutResult.sellerCount,
          paymentInfos,
          // URL cho thanh toán đầu tiên (có thể customize logic)
          primaryPaymentUrl: paymentInfos[0]?.paymentUrl,
        },
      };
    } catch (error) {
      console.error('Cart checkout error:', error);
      throw new HttpException(
        error.message || 'Failed to checkout cart',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Lấy thông tin summary sau checkout
   */
  @Get('checkout-summary/:orderIds')
  @Roles(UserRole.BUYER)
  async getCheckoutSummary(@Param('orderIds') orderIdsParam: string) {
    try {
      // Parse order IDs từ string "1,2,3" thành array [1,2,3]
      const orderIds = orderIdsParam.split(',').map((id) => parseInt(id.trim()));

      const summary = await this.cartService.getCheckoutSummary(orderIds);

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error('Get checkout summary error:', error);
      throw new HttpException(
        error.message || 'Failed to get checkout summary',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Webhook để xử lý payment success cho multiple orders
   * Endpoint này sẽ được gọi khi có order được thanh toán thành công
   */
  @Post('payment-success')
  async handlePaymentSuccess(@Body() paymentData: any) {
    try {
      const { orderIds } = paymentData;

      if (!orderIds || !Array.isArray(orderIds)) {
        throw new Error('Invalid orderIds provided');
      }

      // Xử lý payment success cho multiple orders
      await this.orderBusinessService.handleMultipleOrdersPaid(orderIds);

      return {
        success: true,
        message: 'Payment processed successfully for all orders',
      };
    } catch (error) {
      console.error('Payment success handler error:', error);
      throw new HttpException(
        error.message || 'Failed to process payment success',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * API để test multiple sellers functionality
   */
  @Post('test-multiple-sellers')
  @Roles(UserRole.BUYER)
  async testMultipleSellers(@Req() req: any) {
    // Test data với multiple sellers
    const testCartData: CartCheckoutDto = {
      items: [
        { productId: 1, quantity: 2, price: 50000 }, // Seller 1
        { productId: 2, quantity: 1, price: 30000 }, // Seller 2 
        { productId: 3, quantity: 3, price: 25000 }, // Seller 1
      ],
      note: 'Test multiple sellers checkout',
    };

    return this.checkoutCart(testCartData, req);
  }
}
