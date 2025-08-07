import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto } from './dto/payment.dto';
import { MoMoService } from './services/momo.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private momoService: MoMoService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto & { userId: number }): Promise<PaymentResponseDto> {
    // Kiểm tra order có tồn tại không
    const order = await this.orderRepository.findOne({
      where: { id: createPaymentDto.orderId }
    });

    if (!order) {
      throw new NotFoundException('Order không tồn tại');
    }

    // Kiểm tra đã có payment cho order này chưa
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        orderId: createPaymentDto.orderId,
        status: PaymentStatus.COMPLETED
      }
    });

    if (existingPayment) {
      throw new BadRequestException('Order đã được thanh toán');
    }

    // Tạo payment mới
    const payment = this.paymentRepository.create({
      orderId: createPaymentDto.orderId,
      userId: createPaymentDto.userId,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      status: PaymentStatus.PENDING,
      notes: createPaymentDto.notes,
    });

    const savedPayment = await this.paymentRepository.save(payment);
    return new PaymentResponseDto(savedPayment);
  }

  async updatePayment(paymentId: number, updateData: Partial<UpdatePaymentDto & { status: PaymentStatus }>): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    // Update payment
    Object.assign(payment, updateData);
    const updatedPayment = await this.paymentRepository.save(payment);
    return new PaymentResponseDto(updatedPayment);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { orderId: parseInt(orderId) },
      relations: ['order', 'user']
    });
  }

  async findById(paymentId: number): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'user']
    });
  }

  async createCODPayment(orderData: {
    orderId: number;
    amount: number;
    userId: number;
    orderInfo: string;
    notes?: string;
  }): Promise<PaymentResponseDto> {
    const payment = await this.createPayment({
      orderId: orderData.orderId,
      amount: orderData.amount,
      method: PaymentMethod.COD,
      userId: orderData.userId,
      notes: orderData.notes || `COD Payment for order ${orderData.orderId}`
    });

    return payment;
  }

  async createMoMoPayment(orderData: {
    orderId: string;
    amount: number;
    orderInfo: string;
    userId: number;
    extraData?: string;
  }) {
    // Tạo payment record
    const payment = await this.createPayment({
      orderId: parseInt(orderData.orderId),
      amount: orderData.amount,
      method: PaymentMethod.MOMO,
      userId: orderData.userId,
      notes: `MoMo payment for order ${orderData.orderId}`
    });

    // Tạo MoMo payment URL
    const momoResult = await this.momoService.createPayment({
      orderId: orderData.orderId,
      amount: orderData.amount,
      orderInfo: orderData.orderInfo,
      extraData: orderData.extraData || `payment_${payment.id}`
    });

    if (momoResult.success) {
      // Update payment với MoMo request ID
      await this.updatePayment(payment.id, {
        momoRequestId: momoResult.requestId,
        gatewayResponse: JSON.stringify(momoResult),
        status: PaymentStatus.PROCESSING
      });

      return {
        success: true,
        paymentId: payment.id,
        payUrl: momoResult.payUrl,
        deeplink: momoResult.deeplink,
        qrCodeUrl: momoResult.qrCodeUrl
      };
    } else {
      // Update payment with failure
      await this.updatePayment(payment.id, {
        status: PaymentStatus.FAILED,
        failureReason: momoResult.message,
        gatewayResponse: JSON.stringify(momoResult)
      });

      throw new BadRequestException(momoResult.message || 'Failed to create MoMo payment');
    }
  }

  async handleMoMoIPN(ipnData: any): Promise<{ success: boolean; message: string }> {
    // Verify IPN
    const verification = await this.momoService.verifyIPN(ipnData);

    if (!verification.isValid) {
      return { success: false, message: 'Invalid signature' };
    }

    // Find payment by order ID
    const payment = await this.findByOrderId(ipnData.orderId);
    
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }

    // Update payment status
    const newStatus = ipnData.resultCode === 0 ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
    
    await this.updatePayment(payment.id, {
      momoTransId: ipnData.transId,
      momoResultCode: ipnData.resultCode,
      transactionId: ipnData.transId,
      status: newStatus,
      gatewayResponse: JSON.stringify(ipnData),
      failureReason: ipnData.resultCode !== 0 ? verification.message || 'Payment failed' : undefined
    });

    // TODO: Update order status if payment successful
    if (ipnData.resultCode === 0) {
      // Mark order as paid
      // await this.orderService.markAsPaid(ipnData.orderId);
    }

    return { success: true, message: 'IPN processed successfully' };
  }

  async getPaymentsByUser(userId: number): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.find({
      where: { userId },
      relations: ['order'],
      order: { createdAt: 'DESC' }
    });

    return payments.map(payment => new PaymentResponseDto(payment));
  }

  async getPaymentStats(userId?: number) {
    const whereClause = userId ? { userId } : {};
    
    const [total, completed, failed, pending] = await Promise.all([
      this.paymentRepository.count({ where: whereClause }),
      this.paymentRepository.count({ where: { ...whereClause, status: PaymentStatus.COMPLETED } }),
      this.paymentRepository.count({ where: { ...whereClause, status: PaymentStatus.FAILED } }),
      this.paymentRepository.count({ where: { ...whereClause, status: PaymentStatus.PENDING } })
    ]);

    const totalAmount = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where(userId ? 'payment.userId = :userId' : '1=1', { userId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      total,
      completed,
      failed,
      pending,
      totalAmount: parseFloat(totalAmount?.total || '0')
    };
  }
}
