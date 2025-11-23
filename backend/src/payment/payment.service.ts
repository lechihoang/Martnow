import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from 'nestjs-vnpay';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { PaymentResponseDto } from './dto/payment.dto';
import { OrderStatus } from '../shared/enums';
import {
  ReturnQueryFromVNPay,
  VnpCurrCode,
  VnpLocale,
  ProductCode,
} from 'vnpay';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Tạo URL thanh toán VNPay cho cart checkout
   */
  async createPaymentUrl(
    orderId: number,
    amount?: number,
    manager?: EntityManager,
  ): Promise<string> {
    console.log('🔍 createPaymentUrl called for cart checkout:', {
      orderId,
      amount,
      hasManager: !!manager,
    });

    // Lấy thông tin order - sử dụng manager nếu có để dùng cùng transaction
    const orderRepository = manager
      ? manager.getRepository(Order)
      : this.orderRepository;
    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    this.logger.log(`📋 Order ${orderId} loaded from DB:`, {
      totalPrice: order.totalPrice,
      totalPriceType: typeof order.totalPrice,
      itemsCount: order.items?.length,
    });

    // Tính lại tổng tiền từ items để đảm bảo chính xác
    const calculatedTotal =
      order.items?.reduce((sum, item) => {
        const itemTotal = Number(item.price) * item.quantity;
        this.logger.log(
          `  - Item ${item.productId}: ${item.price} x ${item.quantity} = ${itemTotal}`,
        );
        return sum + itemTotal;
      }, 0) || 0;

    this.logger.log(`💰 Calculated total from items: ${calculatedTotal}`);
    this.logger.log(`💰 Order.totalPrice from DB: ${order.totalPrice}`);

    // Sử dụng amount từ order nếu không truyền vào
    const finalAmount = amount || Number(order.totalPrice);

    // Tạo transaction reference (unique)
    const txnRef = `ORDER_${orderId}_${Date.now()}`;

    // Build payment URL theo đúng repo nestjs-vnpay
    const returnUrl =
      this.configService.get<string>('VNPAY_RETURN_URL') ||
      'http://localhost:3000/payment/vnpay-return';

    // Library nestjs-vnpay tự động xử lý format, không cần nhân 100
    const vnpayAmount = Math.round(finalAmount);

    console.log('🔧 VNPay Config Debug:', {
      tmnCode: this.configService.get<string>('VNPAY_TMN_CODE'),
      hasSecureSecret: !!this.configService.get<string>('VNPAY_SECURE_SECRET'),
      returnUrl,
      originalAmount: finalAmount,
      vnpayAmount: vnpayAmount,
      orderId,
      txnRef,
    });

    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: vnpayAmount,
      vnp_CreateDate: parseInt(this.formatDate(new Date())),
      vnp_CurrCode: VnpCurrCode.VND,
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: VnpLocale.VN,
      vnp_OrderInfo: order.note || `Thanh toán đơn hàng #${order.id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: txnRef,
    });

    console.log('🔗 VNPay Payment URL created:', paymentUrl);

    // Cập nhật order với transaction reference - sử dụng manager nếu có
    if (manager) {
      await manager.update(Order, orderId, {
        paymentReference: txnRef,
      });
    } else {
      await this.orderRepository.update(orderId, {
        paymentReference: txnRef,
      });
    }

    return paymentUrl;
  }

  /**
   * Xác thực callback từ VNPay
   */
  async verifyPayment(query: ReturnQueryFromVNPay) {
    const verifyResult = await this.vnpayService.verifyReturnUrl(query);

    if (verifyResult.isSuccess) {
      const txnRef = query.vnp_TxnRef;
      this.logger.log(`✅ Payment verified successfully: ${txnRef}`);

      const order = await this.orderRepository.findOne({
        where: { paymentReference: txnRef },
        relations: ['items', 'items.product'],
      });

      if (order) {
        // Cập nhật order status thành paid
        await this.orderRepository.update(order.id, {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        });
        this.logger.log(`🎉 Order ${order.id} status updated to paid`);

        // Trừ stock của các sản phẩm
        for (const item of order.items) {
          const product = item.product;
          const newStock = product.stock - item.quantity;

          if (newStock < 0) {
            this.logger.warn(
              `⚠️ Product ${product.id} stock will be negative: ${newStock}`,
            );
          }

          await this.orderRepository.manager.update(
            'product',
            { id: product.id },
            { stock: newStock },
          );

          this.logger.log(
            `📦 Product ${product.id} stock updated: ${product.stock} -> ${newStock}`,
          );
        }
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
  async handleIPN(query: ReturnQueryFromVNPay) {
    const ipnResult = await this.vnpayService.verifyIpnCall(query);

    if (ipnResult.isSuccess) {
      const txnRef = query.vnp_TxnRef;
      this.logger.log(`📞 IPN received for transaction: ${txnRef}`);

      const order = await this.orderRepository.findOne({
        where: { paymentReference: txnRef },
        relations: ['items', 'items.product'],
      });

      if (order && order.status !== OrderStatus.PAID) {
        // Cập nhật order status thành paid
        await this.orderRepository.update(order.id, {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        });
        this.logger.log(`🎉 IPN: Order ${order.id} status updated to paid`);

        // Trừ stock của các sản phẩm
        for (const item of order.items) {
          const product = item.product;
          const newStock = product.stock - item.quantity;

          if (newStock < 0) {
            this.logger.warn(
              `⚠️ Product ${product.id} stock will be negative: ${newStock}`,
            );
          }

          await this.orderRepository.manager.update(
            'product',
            { id: product.id },
            { stock: newStock },
          );

          this.logger.log(
            `📦 IPN: Product ${product.id} stock updated: ${product.stock} -> ${newStock}`,
          );
        }
      } else if (order?.status === OrderStatus.PAID) {
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
   * Verify order ownership - ensure buyer owns the order
   */
  async verifyOrderOwnership(orderId: number, userId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'buyer.user'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.buyer.user.id !== userId) {
      throw new Error('Forbidden: You do not own this order');
    }
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
