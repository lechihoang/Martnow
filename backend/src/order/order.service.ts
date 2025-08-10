import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyerId: number): Promise<Order> {
    const order = this.orderRepository.create({
      buyerId,
      addressId: createOrderDto.addressId,
      note: createOrderDto.note,
      totalPrice: 0, // Sẽ tính từ items
      status: 'pending', // Mặc định chờ thanh toán
    });

    const savedOrder = await this.orderRepository.save(order);
    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  // 🎯 Các methods để track orders chờ thanh toán
  
  /**
   * Lấy tất cả đơn hàng chờ thanh toán
   */
  async getPendingOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      where: { status: 'pending' },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy đơn hàng chờ thanh toán của một buyer cụ thể
   */
  async getPendingOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { 
        buyerId,
        status: 'pending' 
      },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tìm đơn hàng theo payment reference
   */
  async findByPaymentReference(paymentReference: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { paymentReference },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
    });
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(
    orderId: number, 
    paymentReference: string, 
    status: 'paid' | 'failed' | 'cancelled'
  ): Promise<Order> {
    const order = await this.findOne(orderId);
    
    order.paymentReference = paymentReference;
    order.status = status;
    
    if (status === 'paid') {
      order.paidAt = new Date();
    }

    return this.orderRepository.save(order);
  }

  /**
   * Lấy statistics đơn hàng
   */
  async getOrderStatistics() {
    const [total, pending, paid, cancelled] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { status: 'pending' } }),
      this.orderRepository.count({ where: { status: 'paid' } }),
      this.orderRepository.count({ where: { status: 'cancelled' } }),
    ]);

    return {
      total,
      pending,
      paid,
      cancelled,
      pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0,
    };
  }

  /**
   * Lấy đơn hàng bị timeout (quá 30 phút chưa thanh toán)
   */
  async getTimeoutOrders(): Promise<Order[]> {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'user')
      .where('order.status = :status', { status: 'pending' })
      .andWhere('order.createdAt < :timeout', { timeout: thirtyMinutesAgo })
      .orderBy('order.createdAt', 'ASC')
      .getMany();
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
