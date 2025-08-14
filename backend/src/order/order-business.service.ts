import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { SellerStats } from '../seller-stats/entities/seller-stats.entity';

@Injectable()
export class OrderBusinessService {
  private readonly logger = new Logger(OrderBusinessService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(SellerStats)
    private readonly sellerStatsRepository: Repository<SellerStats>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Xử lý logic khi order được thanh toán thành công
   * Đây là function chính được gọi từ PaymentService
   */
  async handleOrderPaid(orderId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`🎉 Processing paid order: ${orderId}`);

      // 1. Lấy order với đầy đủ thông tin
      const order = await this.getOrderWithDetails(orderId, queryRunner);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // 2. Kiểm tra order chưa được xử lý
      if (order.status === 'paid') {
        this.logger.warn(`Order ${orderId} already processed as paid`);
        await queryRunner.commitTransaction();
        return;
      }

      // 3. Cập nhật order status
      await this.updateOrderStatus(orderId, 'paid', queryRunner);

      // 4. Giảm stock sản phẩm
      await this.updateProductStock(order.items, queryRunner);

      // 5. Cập nhật seller stats
      await this.updateSellerStats(order, queryRunner);

      // 6. Log success
      this.logger.log(`✅ Order ${orderId} processed successfully`);
      await queryRunner.commitTransaction();

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`❌ Error processing order ${orderId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy order với đầy đủ thông tin cần thiết
   */
  private async getOrderWithDetails(orderId: number, queryRunner: any): Promise<Order | null> {
    return queryRunner.manager.findOne(Order, {
      where: { id: orderId },
      relations: [
        'items',
        'items.product',
        'items.product.seller',
        'buyer',
        'buyer.user'
      ],
    });
  }

  /**
   * Cập nhật trạng thái order
   */
  private async updateOrderStatus(orderId: number, status: string, queryRunner: any): Promise<void> {
    this.logger.log(`📝 Updating order ${orderId} status to: ${status}`);
    
    await queryRunner.manager.update(Order, orderId, {
      status,
      paidAt: new Date(),
    });
  }

  /**
   * Giảm stock của các sản phẩm trong order
   */
  private async updateProductStock(orderItems: OrderItem[], queryRunner: any): Promise<void> {
    this.logger.log(`📦 Updating stock for ${orderItems.length} products`);

    for (const item of orderItems) {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: item.productId }
      });

      if (!product) {
        this.logger.error(`Product ${item.productId} not found`);
        continue;
      }

      // Kiểm tra stock có đủ không
      if (product.stock < item.quantity) {
        this.logger.warn(
          `Insufficient stock for product ${product.id}. Available: ${product.stock}, Required: ${item.quantity}`
        );
        // Có thể throw error hoặc partial fulfill tùy business requirement
        throw new Error(`Không đủ hàng cho sản phẩm ${product.name}`);
      }

      // Giảm stock
      const newStock = product.stock - item.quantity;
      await queryRunner.manager.update(Product, product.id, {
        stock: newStock
      });

      this.logger.log(
        `📉 Product ${product.name} stock: ${product.stock} → ${newStock} (sold: ${item.quantity})`
      );
    }
  }

  /**
   * Cập nhật seller statistics
   */
  private async updateSellerStats(order: Order, queryRunner: any): Promise<void> {
    this.logger.log(`📊 Updating seller stats for order ${order.id}`);

    // Tính toán stats theo seller
    const sellerStatsMap = new Map<number, {
      totalRevenue: number;
      totalOrders: number;
      productsSold: number;
    }>();

    // Group theo seller
    for (const item of order.items) {
      const sellerId = item.product.seller.id;
      const revenue = item.price * item.quantity;

      if (!sellerStatsMap.has(sellerId)) {
        sellerStatsMap.set(sellerId, {
          totalRevenue: 0,
          totalOrders: 1, // 1 order per seller
          productsSold: 0,
        });
      }

      const stats = sellerStatsMap.get(sellerId)!;
      stats.totalRevenue += revenue;
      stats.productsSold += item.quantity;
    }

    // Cập nhật stats cho từng seller
    for (const [sellerId, orderStats] of sellerStatsMap) {
      await this.updateSellerStatsRecord(sellerId, orderStats, queryRunner);
    }
  }

  /**
   * Cập nhật record seller_stats
   */
  private async updateSellerStatsRecord(
    sellerId: number, 
    orderStats: { totalRevenue: number; totalOrders: number; productsSold: number },
    queryRunner: any
  ): Promise<void> {
    
    // Tìm stats record hiện tại
    let sellerStats = await queryRunner.manager.findOne(SellerStats, {
      where: { id: sellerId }
    });

    if (!sellerStats) {
      // Tạo mới nếu chưa có
      this.logger.log(`📈 Creating new seller stats for seller ${sellerId}`);
      sellerStats = queryRunner.manager.create(SellerStats, {
        id: sellerId,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageRating: 0,
        totalReviews: 0,
      });
    }

    // Cập nhật các chỉ số
    const updatedStats = {
      totalOrders: sellerStats.totalOrders + orderStats.totalOrders,
      totalRevenue: sellerStats.totalRevenue + orderStats.totalRevenue,
      completedOrders: sellerStats.completedOrders + 1,
      // Có thể cập nhật thêm các chỉ số khác nếu cần
    };

    await queryRunner.manager.update(SellerStats, sellerId, updatedStats);

    this.logger.log(
      `📊 Seller ${sellerId} stats updated: +${orderStats.totalRevenue}đ revenue, +1 completed order`
    );
  }

  /**
   * Rollback order khi payment failed (nếu cần)
   */
  async handleOrderFailed(orderId: number): Promise<void> {
    this.logger.log(`❌ Processing failed order: ${orderId}`);
    
    await this.orderRepository.update(orderId, {
      status: 'cancelled',
    });
  }

  /**
   * Lấy order statistics
   */
  async getOrderStats(orderId: number): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'items.product.seller'],
    });

    if (!order) {
      return null;
    }

    const stats = {
      orderId: order.id,
      totalAmount: order.totalPrice,
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      sellersCount: new Set(order.items.map(item => item.product.seller.id)).size,
      status: order.status,
      paidAt: order.paidAt,
    };

    return stats;
  }
}
