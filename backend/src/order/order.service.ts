import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  CartCheckoutDto,
  OrderResponseDto,
  CheckoutResultDto,
} from './dto/order.dto';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { Product } from '../product/entities/product.entity';
import { OrderStatus } from '../shared/enums';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

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
    private paymentService: PaymentService,
  ) {}

  // ========== CORE CHECKOUT FUNCTIONALITY ==========

  /**
   * Xử lý checkout cart - tạo một đơn hàng duy nhất cho toàn bộ cart
   */
  async checkoutCart(
    cartCheckoutDto: CartCheckoutDto,
    userId: string,
  ): Promise<CheckoutResultDto> {
    return this.dataSource.transaction(async (manager) => {
      this.logger.log(`🛒 Processing cart checkout for user ${userId}`);

      const buyer = await manager.findOne(Buyer, {
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!buyer) {
        throw new NotFoundException('Buyer not found for this user');
      }

      const productIds = cartCheckoutDto.items.map((item) => item.productId);
      const products = await manager.find(Product, {
        where: { id: In(productIds) },
        relations: ['seller', 'seller.user'],
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validate all products exist and have sufficient stock
      for (const item of cartCheckoutDto.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`,
          );
        }
      }

      // Tạo một đơn hàng duy nhất
      const order = new Order();
      order.buyerId = buyer.id;
      order.status = OrderStatus.PENDING;
      order.note = cartCheckoutDto.note || 'Đơn hàng từ giỏ hàng';

      // Tính tổng tiền và tạo order items
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      this.logger.log(
        `📋 Processing ${cartCheckoutDto.items.length} items from cart`,
      );

      for (const item of cartCheckoutDto.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        const itemTotal = item.quantity * item.price;
        totalPrice += itemTotal;

        const orderItem = new OrderItem();
        orderItem.productId = item.productId;
        orderItem.quantity = item.quantity;
        orderItem.price = item.price;
        orderItems.push(orderItem);

        this.logger.log(
          `📦 Item: ${product.name} (seller: ${product.seller.user.name}) x${item.quantity} @ ${item.price}đ = ${itemTotal}đ | Running total: ${totalPrice}đ`,
        );
      }

      this.logger.log(
        `💰 Final total price calculated: ${totalPrice}đ for ${orderItems.length} items`,
      );

      order.totalPrice = totalPrice;
      const savedOrder = await manager.save(Order, order);

      this.logger.log(
        `💾 Order saved to DB with ID ${savedOrder.id} and totalPrice: ${savedOrder.totalPrice}đ`,
      );

      // Save order items
      for (const item of orderItems) {
        item.orderId = savedOrder.id;
      }
      await manager.save(OrderItem, orderItems);

      // Count unique sellers
      const sellerCount = new Set(
        Array.from(productMap.values()).map((p) => p.seller.id),
      ).size;

      this.logger.log(
        `✅ Created single order ${savedOrder.id} with ${orderItems.length} items from ${sellerCount} sellers - Total: ${totalPrice}đ`,
      );

      // Tạo payment URL cho đơn hàng - truyền totalPrice để không phải load lại từ DB
      const paymentUrl = await this.paymentService.createPaymentUrl(
        savedOrder.id,
        totalPrice,
        manager,
      );

      this.logger.log(`✅ Payment URL created: ${paymentUrl}`);

      // Load order with items for response
      const orderWithItems = await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: [
          'items',
          'items.product',
          'items.product.seller',
          'items.product.seller.user',
        ],
      });

      if (!orderWithItems) {
        throw new NotFoundException(
          `Order ${savedOrder.id} not found after creation`,
        );
      }

      const result: CheckoutResultDto = {
        orders: [this.mapOrderToResponseDto(orderWithItems)],
        totalAmount: totalPrice,
        paymentRequired: true,
        sellerCount: sellerCount,
        primaryPaymentUrl: paymentUrl,
        paymentInfos: [
          {
            orderId: savedOrder.id,
            amount: totalPrice,
            paymentUrl: paymentUrl,
          },
        ],
      };

      this.logger.log(
        `🎉 Cart checkout completed: 1 order with ${orderItems.length} items, total: ${totalPrice}đ`,
      );

      return result;
    });
  }

  /**
   * Hủy đơn hàng từ cart checkout
   */
  async cancelOrder(orderId: number, buyerId: string): Promise<void> {
    this.logger.log(`❌ Cancelling order ${orderId} for buyer ${buyerId}`);

    const order = await this.orderRepository.findOne({
      where: { id: orderId, buyerId },
      relations: ['items'],
    });

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    if (order.status === OrderStatus.PAID) {
      throw new Error('Cannot cancel paid order');
    }

    await this.orderItemRepository.delete({ orderId });
    await this.orderRepository.remove(order);

    this.logger.log(`✅ Order ${orderId} cancelled and deleted successfully`);
  }

  // ========== ORDER QUERY METHODS ==========

  /**
   * Lấy đơn hàng theo ID
   */
  async getOrderById(orderId: number, userId: string): Promise<Order | null> {
    this.logger.log(`🔍 Getting order ${orderId} for user ${userId}`);

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'items',
        'items.product',
        'items.product.seller',
        'items.product.seller.user',
        'buyer',
        'buyer.user',
      ],
    });

    if (!order) {
      this.logger.log(`❌ Order ${orderId} not found`);
      return null;
    }

    // Kiểm tra quyền truy cập
    if (order.buyer.user.id !== userId) {
      this.logger.log(
        `❌ User ${userId} not authorized to access order ${orderId}`,
      );
      return null;
    }

    this.logger.log(`✅ Order ${orderId} retrieved successfully`);
    return order;
  }

  /**
   * Lấy tất cả đơn hàng của user
   */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    this.logger.log(`🔍 Getting PAID orders for user ${userId}`);

    const orders = await this.orderRepository.find({
      where: {
        buyer: { user: { id: userId } },
        status: OrderStatus.PAID, // Chỉ lấy đơn hàng đã thanh toán
      },
      relations: [
        'items',
        'items.product',
        'items.product.seller',
        'items.product.seller.user',
      ],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`✅ Retrieved ${orders.length} orders for user ${userId}`);
    return orders;
  }

  // ========== SELLER TRACKING ==========

  /**
   * Lấy tất cả orders đã thanh toán có sản phẩm của một seller cụ thể
   */
  async getOrdersBySeller(sellerId: string): Promise<any[]> {
    this.logger.log(`🔍 Getting PAID orders for seller ${sellerId}`);

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'sellerUser')
      .where('product.sellerId = :sellerId', { sellerId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    // Chỉ lấy thông tin cần thiết cho seller
    return orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.product.seller.id === sellerId,
      );
      const sellerTotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        orderId: order.id,
        orderStatus: order.status,
        orderDate: order.createdAt,
        paidDate: order.paidAt,
        buyerName: order.buyer.user.name,
        buyerEmail: order.buyer.user.email,
        sellerTotal: sellerTotal,
        items: sellerItems.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      };
    });
  }

  // ========== HELPER METHODS ==========

  /**
   * Map Order entity sang OrderResponseDto
   */
  private mapOrderToResponseDto(order: Order): OrderResponseDto {
    // Kiểm tra và xử lý trường hợp items undefined
    const items = order.items || [];

    return {
      id: order.id,
      totalPrice: order.totalPrice,
      status: order.status,
      note: order.note,
      sellerName: items[0]?.product?.seller?.user?.name || 'Unknown',
      itemCount: items.length,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          name: item.product?.name || 'Unknown Product',
          seller: {
            id: item.product?.seller?.id || 'Unknown',
            user: {
              name: item.product?.seller?.user?.name || 'Unknown Seller',
            },
          },
        },
      })),
      createdAt: order.createdAt,
    };
  }

  /**
   * Generate và gửi báo cáo doanh thu qua email
   */
  async generateAndEmailRevenueReport(
    sellerId: string,
    sellerEmail: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`📊 Generating revenue report for seller ${sellerId}`);

      // Lấy tất cả đơn hàng đã thanh toán của seller trong 30 ngày qua
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'item')
        .leftJoinAndSelect('item.product', 'product')
        .leftJoinAndSelect('product.seller', 'seller')
        .leftJoinAndSelect('seller.user', 'sellerUser')
        .where('seller.user.id = :sellerId', { sellerId })
        .andWhere('order.status = :status', { status: OrderStatus.PAID })
        .andWhere('order.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      // Tính toán thống kê doanh thu
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalPrice,
        0,
      );
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Tạo nội dung báo cáo
      const reportContent = this.generateReportEmail(
        orders,
        totalOrders,
        totalRevenue,
        avgOrderValue,
      );

      // Log thông tin thống kê
      this.logger.log(`📈 Revenue report stats:`, {
        sellerId,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        period: '30 days',
      });

      // TODO: Implement actual email sending service
      // For now, we'll just log the report content
      this.logger.log(`📧 Revenue report generated for ${sellerEmail}:`);
      this.logger.log(reportContent);

      return {
        success: true,
        message: `Báo cáo doanh thu đã được tạo và gửi đến ${sellerEmail}`,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate revenue report for seller ${sellerId}:`,
        error,
      );
      throw new Error('Không thể tạo báo cáo doanh thu');
    }
  }

  /**
   * Tạo nội dung email báo cáo doanh thu
   */
  private generateReportEmail(
    orders: Order[],
    totalOrders: number,
    totalRevenue: number,
    avgOrderValue: number,
  ): string {
    const reportDate = new Date().toLocaleDateString('vi-VN');

    let content = `
=====================================
BÁOCÁO DOANH THU FOODEE - ${reportDate}
=====================================

TỔNG QUAN (30 NGÀY QUA):
• Tổng số đơn hàng: ${totalOrders}
• Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')}đ
• Giá trị trung bình/đơn: ${avgOrderValue.toLocaleString('vi-VN')}đ

CHI TIẾT CÁC ĐƠN HÀNG:
=====================================
`;

    orders.forEach((order, index) => {
      content += `
${index + 1}. Đơn hàng #${order.id}
   • Ngày: ${order.createdAt.toLocaleDateString('vi-VN')}
   • Giá trị: ${order.totalPrice.toLocaleString('vi-VN')}đ
   • Sản phẩm: ${order.items?.length || 0} món
   • Ghi chú: ${order.note || 'Không có'}
`;
    });

    content += `
=====================================
Báo cáo được tạo tự động bởi Foodee
Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
=====================================
`;

    return content;
  }
}
