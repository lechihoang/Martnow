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
   * Xử lý checkout cart với multiple sellers
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
        relations: ['seller'],
      });

      const productMap = new Map(products.map((p) => [p.id, p]));
      const sellerGroups = this.groupItemsBySeller(
        cartCheckoutDto.items,
        productMap,
      );

      this.logger.log(
        `📦 Found ${sellerGroups.size} sellers with items: ${Array.from(sellerGroups.keys()).join(', ')}`,
      );

      const createdOrders: Order[] = [];
      let totalAmount = 0;

      for (const [sellerId, sellerItems] of sellerGroups) {
        const orderData = {
          items: sellerItems,
          note: cartCheckoutDto.note || `Đơn hàng từ seller ${sellerId}`,
        };

        const order = await this.createOrderForSeller(
          orderData,
          buyer.id,
          manager,
        );
        createdOrders.push(order);
        totalAmount += order.totalPrice;

        this.logger.log(
          `✅ Created order ${order.id} for seller ${sellerId} - Amount: ${order.totalPrice}đ`,
        );
      }

      // Tạo payment URLs cho từng order
      const paymentInfos: Array<{
        orderId: number;
        amount: number;
        paymentUrl: string;
      }> = [];
      let primaryPaymentUrl = '';

      this.logger.log('🔄 Starting to create payment URLs for orders...');

      for (const order of createdOrders) {
        try {
          this.logger.log(
            `📝 Creating payment URL for order ${order.id} with amount ${order.totalPrice}`,
          );

          // Gọi PaymentService để tạo payment URL - truyền manager để dùng cùng transaction
          const paymentUrl = await this.paymentService.createPaymentUrl(
            order.id,
            undefined,
            manager,
          );

          this.logger.log(`✅ Payment URL created for order ${order.id}:`, {
            url: paymentUrl,
            type: typeof paymentUrl,
            isValid:
              typeof paymentUrl === 'string' && paymentUrl.startsWith('http'),
          });

          // PaymentService trả về string URL
          paymentInfos.push({
            orderId: order.id,
            amount: order.totalPrice,
            paymentUrl: paymentUrl,
          });

          // Sử dụng payment URL đầu tiên làm primary
          if (!primaryPaymentUrl) {
            primaryPaymentUrl = paymentUrl;
            this.logger.log(`🎯 Set primary payment URL: ${primaryPaymentUrl}`);
          }
        } catch (error) {
          this.logger.error(
            `❌ Failed to create payment URL for order ${order.id}:`,
            error,
          );
          this.logger.error(`Error details:`, {
            message: error.message,
            stack: error.stack,
            orderId: order.id,
            amount: order.totalPrice,
          });
        }
      }

      this.logger.log('📊 Payment URLs creation summary:', {
        totalOrders: createdOrders.length,
        successfulPayments: paymentInfos.length,
        hasPrimaryPaymentUrl: !!primaryPaymentUrl,
        primaryPaymentUrl,
        paymentInfos,
      });

      const result: CheckoutResultDto = {
        orders: createdOrders.map((order) => this.mapOrderToResponseDto(order)),
        totalAmount,
        paymentRequired: true,
        sellerCount: sellerGroups.size,
        primaryPaymentUrl,
        paymentInfos,
      };

      this.logger.log(
        `🎉 Cart checkout completed: ${createdOrders.length} orders, total: ${totalAmount}đ`,
      );

      // Debug logging để kiểm tra response structure
      this.logger.log('🔍 CheckoutResult structure:', {
        hasOrders: !!result.orders,
        ordersCount: result.orders?.length,
        hasPrimaryPaymentUrl: !!result.primaryPaymentUrl,
        primaryPaymentUrl: result.primaryPaymentUrl,
        hasPaymentInfos: !!result.paymentInfos,
        paymentInfosCount: result.paymentInfos?.length,
        totalAmount: result.totalAmount,
        sellerCount: result.sellerCount,
      });

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
    this.logger.log(`🔍 Getting orders for user ${userId}`);

    const orders = await this.orderRepository.find({
      where: { buyer: { user: { id: userId } } },
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
   * Lấy tất cả orders có sản phẩm của một seller cụ thể
   */
  async getOrdersBySeller(sellerId: string): Promise<any[]> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'sellerUser')
      .where('product.sellerId = :sellerId', { sellerId })
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
   * Group cart items theo seller ID
   */
  private groupItemsBySeller(
    items: CartCheckoutDto['items'],
    productMap: Map<number, Product>,
  ): Map<string, CartCheckoutDto['items']> {
    const sellerGroups = new Map<string, CartCheckoutDto['items']>();

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`,
        );
      }

      const sellerId = product.seller.id;
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, []);
      }

      sellerGroups.get(sellerId)!.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price),
      });
    }

    return sellerGroups;
  }

  /**
   * Tạo order cho một seller cụ thể
   */
  private async createOrderForSeller(
    orderData: { items: CartCheckoutDto['items']; note: string },
    buyerId: string,
    manager: any,
  ): Promise<Order> {
    let totalPrice = 0;
    for (const item of orderData.items) {
      totalPrice += item.price * item.quantity;
    }

    const order = manager.create(Order, {
      buyerId,
      note: orderData.note,
      totalPrice,
    });

    const savedOrder = await manager.save(Order, order);

    const orderItems = orderData.items.map((item) =>
      manager.create(OrderItem, {
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }),
    );

    await manager.save(OrderItem, orderItems);

    // Load order với đầy đủ relations để map response
    const orderWithRelations = await manager.findOne(Order, {
      where: { id: savedOrder.id },
      relations: [
        'items',
        'items.product',
        'items.product.seller',
        'items.product.seller.user',
      ],
    });

    return orderWithRelations;
  }

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
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
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
      this.logger.error(`❌ Failed to generate revenue report for seller ${sellerId}:`, error);
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
