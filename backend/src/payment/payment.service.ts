import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from 'nestjs-vnpay';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { OrderBusinessService } from '../order/order-business.service';
import { CreatePaymentDto, PaymentResponseDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly orderBusinessService: OrderBusinessService,
  ) {}

  /**
   * Tạo URL thanh toán VNPay (với DTO)
   */
  async createPaymentUrl(
    orderId: number,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto>;

  /**
   * Tạo URL thanh toán VNPay (với amount trực tiếp)
   */
  async createPaymentUrl(orderId: number, amount: number): Promise<string>;

  async createPaymentUrl(
    orderId: number,
    createPaymentDtoOrAmount: CreatePaymentDto | number,
  ): Promise<PaymentResponseDto | string> {
    if (typeof createPaymentDtoOrAmount === 'number') {
      // Overload cho cart checkout
      const amount = createPaymentDtoOrAmount;
      return this.createSimplePaymentUrl(orderId, amount);
    } else {
      // Original method
      return this.createFullPaymentUrl(orderId, createPaymentDtoOrAmount);
    }
  }

  /**
   * Tạo URL thanh toán đơn giản (cho cart)
   */
  private async createSimplePaymentUrl(
    orderId: number,
    amount: number,
  ): Promise<string> {
    // Lấy thông tin order
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Tạo transaction reference (unique)
    const txnRef = `ORDER_${orderId}_${Date.now()}`;

    // Build payment URL
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: Math.round(amount),
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

    return paymentUrl;
  }

  /**
   * Tạo URL thanh toán đầy đủ (original)
   */
  private async createFullPaymentUrl(
    orderId: number,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
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
      description: `${order.totalPrice} VND -> ${amount} VND (không nhân 100)`,
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
      const txnRef = query.vnp_TxnRef;
      this.logger.log(`✅ Payment verified successfully: ${txnRef}`);

      const order = await this.orderRepository.findOne({
        where: { paymentReference: txnRef },
      });

      if (order) {
        // 🔥 Gọi business logic để xử lý order paid
        await this.orderBusinessService.handleOrderPaid(order.id);
        this.logger.log(`🎉 Order ${order.id} business logic completed`);
      } else {
        this.logger.error(`❌ Order not found for transaction: ${txnRef}`);
      }
    } else {
      this.logger.warn(`❌ Payment verification failed: ${query.vnp_TxnRef}`);
    }

    return verifyResult;
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   */
  async handleIPN(query: any) {
    const ipnResult = await this.vnpayService.verifyIpnCall(query);

    if (ipnResult.isSuccess) {
      const txnRef = query.vnp_TxnRef;
      this.logger.log(`📞 IPN received for transaction: ${txnRef}`);

      const order = await this.orderRepository.findOne({
        where: { paymentReference: txnRef },
      });

      if (order && order.status !== 'paid') {
        // 🔥 Gọi business logic để xử lý order paid
        await this.orderBusinessService.handleOrderPaid(order.id);
        this.logger.log(`🎉 IPN: Order ${order.id} business logic completed`);
      } else if (order?.status === 'paid') {
        this.logger.log(`ℹ️  IPN: Order ${order.id} already processed`);
      } else {
        this.logger.error(`❌ IPN: Order not found for transaction: ${txnRef}`);
      }
    } else {
      this.logger.warn(`❌ IPN verification failed: ${query.vnp_TxnRef}`);
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
