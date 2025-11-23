import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentCallbackDto } from './dto/payment.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Public } from '../auth/public.decorator';
import { UserRole } from '../lib/supabase';

interface RequestWithUser {
  user: {
    id: string;
    role: UserRole;
  };
}

@Controller('payment')
@UseGuards(SupabaseAuthGuard, RoleGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Tạo URL thanh toán cho order
   * Chỉ buyer owner của order mới được tạo payment
   */
  @Post('create/:orderId')
  @Roles(UserRole.BUYER)
  async createPayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: RequestWithUser,
  ) {
    // Verify ownership: check if order belongs to the buyer
    await this.paymentService.verifyOrderOwnership(orderId, req.user.id);

    // Không cần truyền amount, service sẽ tự lấy từ order
    const result = await this.paymentService.createPaymentUrl(orderId);
    return {
      message: 'Payment URL created successfully',
      data: result,
    };
  }

  /**
   * Endpoint xử lý return URL từ VNPay (người dùng được chuyển về đây sau khi thanh toán)
   * Public endpoint - VNPay redirects users here
   */
  @Public()
  @Get('vnpay-return')
  async handleReturn(@Query() query: PaymentCallbackDto) {
    const result = await this.paymentService.verifyPayment(query);

    if (result.isSuccess) {
      // Chuyển hướng đến trang thành công
      return {
        message: 'Payment successful',
        data: result,
      };
    } else {
      // Chuyển hướng đến trang thất bại
      return {
        message: 'Payment failed',
        error: result.message,
      };
    }
  }

  /**
   * Endpoint xử lý IPN từ VNPay (VNPay gọi về server khi có thay đổi trạng thái)
   * Public endpoint - VNPay server calls this
   */
  @Public()
  @Post('vnpay-ipn')
  async handleIPN(@Body() query: PaymentCallbackDto) {
    const result = await this.paymentService.handleIPN(query);

    // Phản hồi theo format yêu cầu của VNPay
    if (result.isSuccess) {
      return { RspCode: '00', Message: 'Confirm Success' };
    } else {
      return { RspCode: '99', Message: 'Checksum failed' };
    }
  }

  /**
   * Lấy danh sách ngân hàng
   * Public endpoint
   */
  @Public()
  @Get('banks')
  async getBankList() {
    const banks = await this.paymentService.getBankList();
    return {
      message: 'Bank list retrieved successfully',
      data: banks,
    };
  }

  /**
   * Truy vấn kết quả thanh toán
   * Requires authentication
   */
  @Get('query/:txnRef/:txnDate')
  async queryPayment(
    @Param('txnRef') txnRef: string,
    @Param('txnDate') txnDate: string,
    @Req() req: RequestWithUser,
  ) {
    // Only authenticated users can query payment status
    const result = await this.paymentService.queryPayment(txnRef, txnDate);
    return {
      message: 'Payment query completed',
      data: result,
    };
  }

  /**
   * Hoàn tiền
   * Chỉ SELLER mới có thể refund
   */
  @Post('refund')
  @Roles(UserRole.SELLER)
  async refundPayment(
    @Body() body: { txnRef: string; amount: number; reason: string },
    @Req() req: RequestWithUser,
  ) {
    // Only sellers can issue refunds
    const result = await this.paymentService.refundPayment(
      body.txnRef,
      body.amount,
      body.reason,
    );
    return {
      message: 'Refund request completed',
      data: result,
    };
  }
}
