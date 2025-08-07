import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
  Logger,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import {
  CreateCODPaymentDto,
  CreateMoMoPaymentDto,
  PaymentResponseDto
} from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  // Get user payments
  @Get('my-payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async getMyPayments(@Request() req): Promise<PaymentResponseDto[]> {
    const userId = req.user.userId;
    return this.paymentService.getPaymentsByUser(userId);
  }

  // Get payment stats
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async getPaymentStats(@Request() req) {
    const userId = req.user.userId;
    return this.paymentService.getPaymentStats(userId);
  }

  // Get payment by ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const payment = await this.paymentService.findById(id);
    
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }

    // Check ownership
    if (payment.userId !== req.user.userId) {
      return { success: false, message: 'Unauthorized' };
    }

    return { success: true, payment: new PaymentResponseDto(payment) };
  }

  // ============ COD PAYMENT ============
  @Post('cod/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async createCODPayment(@Body() createCODDto: CreateCODPaymentDto, @Request() req) {
    try {
      this.logger.log(`COD payment creation requested by user: ${req.user.userId}`);

      const payment = await this.paymentService.createCODPayment({
        orderId: createCODDto.orderId,
        amount: createCODDto.amount,
        userId: req.user.userId,
        orderInfo: createCODDto.orderInfo,
        notes: createCODDto.notes
      });

      this.logger.log(`COD payment created for order: ${createCODDto.orderId}`);

      return {
        success: true,
        payment,
        message: 'COD payment created successfully'
      };

    } catch (error) {
      this.logger.error(`COD payment creation failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Failed to create COD payment'
      };
    }
  }

  // ============ MOMO PAYMENT ============
  @Post('momo/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async createMoMoPayment(@Body() createMoMoDto: CreateMoMoPaymentDto, @Request() req) {
    try {
      this.logger.log(`MoMo payment creation requested by user: ${req.user.userId}`);

      const result = await this.paymentService.createMoMoPayment({
        orderId: createMoMoDto.orderId,
        amount: createMoMoDto.amount,
        orderInfo: createMoMoDto.orderInfo,
        userId: req.user.userId,
        extraData: createMoMoDto.extraData
      });

      this.logger.log(`MoMo payment URL created for order: ${createMoMoDto.orderId}`);

      return result;

    } catch (error) {
      this.logger.error(`MoMo payment creation failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Failed to create MoMo payment'
      };
    }
  }

  @Post('momo/notify')
  async handleMoMoIPN(@Body() body: any, @Res() res: Response) {
    try {
      this.logger.log(`MoMo IPN received for order: ${body.orderId}`);
      this.logger.debug(`MoMo IPN data: ${JSON.stringify(body)}`);

      const result = await this.paymentService.handleMoMoIPN(body);

      if (result.success) {
        this.logger.log(`MoMo IPN processed successfully for order: ${body.orderId}`);
        // MoMo expects empty 204 response for successful IPN
        return res.status(HttpStatus.NO_CONTENT).send();
      } else {
        this.logger.warn(`MoMo IPN processing failed: ${result.message}`);
        return res.status(HttpStatus.BAD_REQUEST).json({ message: result.message });
      }

    } catch (error) {
      this.logger.error(`MoMo IPN processing failed: ${error.message}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: 'Internal server error' 
      });
    }
  }

  @Post('momo/return')
  async handleMoMoReturn(@Body() body: any) {
    try {
      this.logger.log(`MoMo return for order: ${body.orderId}`);

      // For return URL, we just need to show result to user
      // The actual payment processing is done via IPN
      return {
        success: body.resultCode === 0,
        orderId: body.orderId,
        resultCode: body.resultCode,
        message: body.resultCode === 0 ? 'Thanh toán thành công' : 'Thanh toán thất bại'
      };

    } catch (error) {
      this.logger.error(`MoMo return processing failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Processing failed'
      };
    }
  }

  // ============ ADMIN ENDPOINTS ============
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminPaymentStats() {
    return this.paymentService.getPaymentStats();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllPayments() {
    // TODO: Add pagination
    const payments = await this.paymentService.getPaymentsByUser(undefined);
    return { success: true, payments };
  }
}
