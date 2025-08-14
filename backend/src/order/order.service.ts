import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/order.dto';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { Product } from '../product/entities/product.entity';
import { OrderStatus } from '../shared/enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async createFromUserId(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    // Tìm buyer từ userId
    const buyer = await this.buyerRepository.findOne({
      where: { user: { id: parseInt(userId) } },
      relations: ['user']
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found for this user');
    }

    return this.create(createOrderDto, buyer.id);
  }

  // ✅ Optimized: Create order with transaction and bulk operations
  async create(createOrderDto: CreateOrderDto, buyerId: number): Promise<Order> {
    return this.dataSource.transaction(async manager => {
      // ✅ Bulk load all products to avoid N+1 queries
      const productIds = createOrderDto.items.map(item => item.productId);
      const products = await manager.find(Product, {
        where: { id: In(productIds) }
      });

      // Create product lookup map
      const productMap = new Map(products.map(p => [p.id, p]));

      // Validate all products exist and calculate total
      let totalPrice = 0;
      const validItems: any[] = [];

      for (const item of createOrderDto.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        
        // Check stock
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const itemTotal = Number(product.price) * item.quantity;
        totalPrice += itemTotal;
        
        validItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          product
        });
      }

      // Create order
      const order = manager.create(Order, {
        buyerId,
        note: createOrderDto.note,
        totalPrice,
        status: OrderStatus.WAITING_PAYMENT,
      });

      const savedOrder = await manager.save(Order, order);

      // ✅ Bulk create order items
      const orderItems = validItems.map(item => 
        manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })
      );

      await manager.save(OrderItem, orderItems);

      // ✅ Bulk update product stock
      for (const item of validItems) {
        await manager.decrement(Product, { id: item.productId }, 'stock', item.quantity);
      }

      return savedOrder;
    });
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

  // 🎯 Các methods để quản lý orders
  
  /**
   * Lấy tất cả đơn hàng chờ thanh toán (dành cho admin)
   */
  async getPendingOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      where: { status: OrderStatus.WAITING_PAYMENT },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
  
  /**
   * Lấy đơn hàng đã thanh toán của buyer
   */
  async getPaidOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { 
        buyerId,
        status: OrderStatus.PAID 
      },
      relations: ['buyer', 'buyer.user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
  
  /**
   * Lấy đơn hàng của seller (đang bán + đã bán hết)
   */
  async getOrdersBySeller(sellerId: number): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('product.sellerId = :sellerId', { sellerId })
      .andWhere('order.status IN (:...statuses)', { 
        statuses: [OrderStatus.SELLING, OrderStatus.SOLD_OUT] 
      })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Lấy đơn hàng chờ thanh toán của một buyer cụ thể
   */
  async getPendingOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { 
        buyerId,
        status: OrderStatus.WAITING_PAYMENT 
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
    status: OrderStatus.PAID | OrderStatus.CANCELLED
  ): Promise<Order> {
    const order = await this.findOne(orderId);
    
    order.paymentReference = paymentReference;
    order.status = status;
    
    if (status === OrderStatus.PAID) {
      order.paidAt = new Date();
    }

    return this.orderRepository.save(order);
  }

  /**
   * Lấy statistics đơn hàng
   */
  async getOrderStatistics() {
    const [total, waiting, paid, cancelled] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { status: OrderStatus.WAITING_PAYMENT } }),
      this.orderRepository.count({ where: { status: OrderStatus.PAID } }),
      this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    return {
      total,
      waiting_payment: waiting,
      paid,
      cancelled,
      waitingPercentage: total > 0 ? Math.round((waiting / total) * 100) : 0,
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
      .where('order.status = :status', { status: OrderStatus.WAITING_PAYMENT })
      .andWhere('order.createdAt < :timeout', { timeout: thirtyMinutesAgo })
      .orderBy('order.createdAt', 'ASC')
      .getMany();
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
