import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CreateOrderDto } from './dto/order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Chỉ buyer mới có thể tạo đơn hàng
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    // Lấy userId từ JWT token
    const userId = req.user.userId;
    return this.orderService.createFromUserId(createOrderDto, userId);
  }

  // 🎯 API để track orders chờ thanh toán

  // Bỏ API getPendingOrders vì không còn có pending status

  /**
   * Lấy đơn hàng của buyer hiện tại
   */
  @Get('my-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async getMyOrders(@Req() req: any) {
    const buyerId = req.user.buyerId;
    return this.orderService.getOrdersByBuyer(buyerId);
  }

  /**
   * Lấy statistics đơn hàng (Admin only)
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getOrderStatistics() {
    return this.orderService.getOrderStatistics();
  }

  // Bỏ API getTimeoutOrders vì không còn có timeout logic

  /**
   * Tìm đơn hàng theo payment reference
   */
  @Get('payment/:paymentRef')
  @UseGuards(JwtAuthGuard)
  async findByPaymentReference(@Param('paymentRef') paymentRef: string) {
    return this.orderService.findByPaymentReference(paymentRef);
  }

  /**
   * Lấy tất cả đơn hàng
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllOrders() {
    return this.orderService.findAll();
  }

  /**
   * Lấy một đơn hàng cụ thể
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }
}
