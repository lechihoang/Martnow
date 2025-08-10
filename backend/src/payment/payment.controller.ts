import { Controller, Post, Get, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, PaymentCallbackDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Tạo URL thanh toán cho order
   */
  @Post('create/:orderId')
  async createPayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const result = await this.paymentService.createPaymentUrl(orderId, createPaymentDto);
    return {
      message: 'Payment URL created successfully',
      data: result,
    };
  }

  /**
   * Endpoint xử lý return URL từ VNPay (người dùng được chuyển về đây sau khi thanh toán)
   */
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
   */
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
   */
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
   */
  @Get('query/:txnRef/:txnDate')
  async queryPayment(
    @Param('txnRef') txnRef: string,
    @Param('txnDate') txnDate: string,
  ) {
    const result = await this.paymentService.queryPayment(txnRef, txnDate);
    return {
      message: 'Payment query completed',
      data: result,
    };
  }

  /**
   * Hoàn tiền
   */
  @Post('refund')
  async refundPayment(@Body() body: { txnRef: string; amount: number; reason: string }) {
    const result = await this.paymentService.refundPayment(body.txnRef, body.amount, body.reason);
    return {
      message: 'Refund request completed',
      data: result,
    };
  }
}
