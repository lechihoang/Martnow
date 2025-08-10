import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from 'nestjs-vnpay';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { CreatePaymentDto, PaymentResponseDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Tạo URL thanh toán VNPay
   */
  async createPaymentUrl(orderId: number, createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // Lấy thông tin order
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Tính tổng tiền (VNPay nhận VND trực tiếp, không cần nhân 100)
    const amount = Math.round(order.totalPrice);
    
    console.log('Payment Debug:', {
      orderId,
      originalAmount: order.totalPrice,
      convertedAmount: amount,
      description: `${order.totalPrice} VND -> ${amount} VND (không nhân 100)`
    });

    // Tạo transaction reference (unique)
    const txnRef = `ORDER_${orderId}_${Date.now()}`;

    // Build payment URL
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_CreateDate: parseInt(this.formatDate(new Date())),
      vnp_CurrCode: 'VND' as any,
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn' as any,
      vnp_OrderInfo: order.note || `Thanh toán đơn hàng #${order.id}`,
      vnp_OrderType: 'other' as any,
      vnp_ReturnUrl: this.configService.get('VNPAY_RETURN_URL') || '',
      vnp_TxnRef: txnRef,
    });

    // Cập nhật order với transaction reference
    await this.orderRepository.update(orderId, {
      paymentReference: txnRef,
    });

    return {
      paymentUrl,
      txnRef,
      amount,
      orderId,
    };
  }

  /**
   * Xác thực callback từ VNPay
   */
  async verifyPayment(query: any) {
    const verifyResult = await this.vnpayService.verifyReturnUrl(query);
    
    if (verifyResult.isSuccess) {
      // Thanh toán thành công - cập nhật order status
      const txnRef = query.vnp_TxnRef;
      const order = await this.orderRepository.findOne({
        where: { paymentReference: txnRef },
      });

      if (order) {
        await this.orderRepository.update(order.id, {
          status: 'paid', // Cập nhật trạng thái đã thanh toán
          paidAt: new Date(),
        });
      }
    }

    return verifyResult;
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   */
  async handleIPN(query: any) {
    const ipnResult = await this.vnpayService.verifyIpnCall(query);
    
    if (ipnResult.isSuccess) {
      // Xử lý logic cập nhật database
      const txnRef = query.vnp_TxnRef;
      const order = await this.orderRepository.findOne({
        where: { paymentReference: txnRef },
      });

      if (order && order.status !== 'paid') {
        await this.orderRepository.update(order.id, {
          status: 'paid',
          paidAt: new Date(),
        });
      }
    }

    return ipnResult;
  }

  /**
   * Lấy danh sách ngân hàng
   */
  async getBankList() {
    return this.vnpayService.getBankList();
  }

  /**
   * Truy vấn kết quả thanh toán
   */
  async queryPayment(txnRef: string, txnDate: string) {
    return this.vnpayService.queryDr({
      vnp_RequestId: `query_${Date.now()}`,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Query payment ${txnRef}`,
      vnp_TransactionDate: parseInt(txnDate),
      vnp_CreateDate: parseInt(this.formatDate(new Date())),
      vnp_IpAddr: '127.0.0.1',
      vnp_TransactionNo: 0,
    });
  }

  /**
   * Hoàn tiền
   */
  async refundPayment(txnRef: string, amount: number, refundReason: string) {
    return this.vnpayService.refund({
      vnp_RequestId: `refund_${Date.now()}`,
      vnp_Amount: amount,
      vnp_TxnRef: `REFUND_${txnRef}_${Date.now()}`,
      vnp_OrderInfo: refundReason,
      vnp_TransactionType: '02',
      vnp_CreateBy: 'ADMIN',
      vnp_CreateDate: parseInt(this.formatDate(new Date())),
      vnp_TransactionDate: parseInt(this.formatDate(new Date())),
      vnp_IpAddr: '127.0.0.1',
    });
  }

  /**
   * Format date theo yêu cầu VNPay (yyyyMMddHHmmss)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}
