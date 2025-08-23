import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import { OrderStatus } from '../shared/enums';

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CartCheckoutDto {
  items: CartItem[];
  note?: string;
}

export interface CheckoutResult {
  orders: Order[];
  totalAmount: number;
  paymentRequired: boolean;
  sellerCount: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Buyer)
    private readonly buyerRepository: Repository<Buyer>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Xử lý checkout cart với multiple sellers
   * Logic chính: tạo multiple orders nếu có nhiều sellers
   */
  async checkoutCart(
    cartCheckoutDto: CartCheckoutDto,
    userId: string,
  ): Promise<CheckoutResult> {
    return this.dataSource.transaction(async (manager) => {
      this.logger.log(`🛒 Processing cart checkout for user ${userId}`);

      // 1. Tìm buyer
      const buyer = await manager.findOne(Buyer, {
        where: { user: { id: parseInt(userId) } },
        relations: ['user'],
      });

      if (!buyer) {
        throw new NotFoundException('Buyer not found for this user');
      }

      // 2. Load tất cả products và group theo seller
      const productIds = cartCheckoutDto.items.map((item) => item.productId);
      const products = await manager.find(Product, {
        where: { id: In(productIds) },
        relations: ['seller'],
      });

      // Tạo product lookup map
      const productMap = new Map(products.map((p) => [p.id, p]));

      // 3. Validate và group items theo seller
      const sellerGroups = this.groupItemsBySeller(
        cartCheckoutDto.items,
        productMap,
      );

      this.logger.log(
        `📦 Found ${sellerGroups.size} sellers with items: ${Array.from(
          sellerGroups.keys(),
        ).join(', ')}`,
      );

      // 4. Tạo orders cho từng seller
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

      // 5. Return result
      const result: CheckoutResult = {
        orders: createdOrders,
        totalAmount,
        paymentRequired: true,
        sellerCount: sellerGroups.size,
      };

      this.logger.log(
        `🎉 Cart checkout completed: ${createdOrders.length} orders, total: ${totalAmount}đ`,
      );

      return result;
    });
  }

  /**
   * Group cart items theo seller ID
   */
  private groupItemsBySeller(
    items: CartItem[],
    productMap: Map<number, Product>,
  ): Map<number, CartItem[]> {
    const sellerGroups = new Map<number, CartItem[]>();

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Validate stock
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
        price: Number(product.price), // Sử dụng giá từ database
      });
    }

    return sellerGroups;
  }

  /**
   * Tạo order cho một seller cụ thể
   */
  private async createOrderForSeller(
    orderData: { items: CartItem[]; note: string },
    buyerId: number,
    manager: any,
  ): Promise<Order> {
    // Tính tổng tiền
    let totalPrice = 0;
    for (const item of orderData.items) {
      totalPrice += item.price * item.quantity;
    }

    // Tạo order với trạng thái mặc định
    const order = manager.create(Order, {
      buyerId,
      note: orderData.note,
      totalPrice,
      // Sử dụng default status từ entity (PAID)
    });

    const savedOrder = await manager.save(Order, order);

    // Tạo order items
    const orderItems = orderData.items.map((item) =>
      manager.create(OrderItem, {
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }),
    );

    await manager.save(OrderItem, orderItems);

    return savedOrder;
  }

  /**
   * Lấy thông tin orders sau checkout để hiển thị cho user
   */
  async getCheckoutSummary(orderIds: number[]): Promise<any> {
    const orders = await this.orderRepository.find({
      where: { id: In(orderIds) },
      relations: ['buyer', 'buyer.user', 'items', 'items.product', 'items.product.seller'],
      order: { createdAt: 'DESC' },
    });

    const summary = {
      orders: orders.map((order) => ({
        id: order.id,
        totalPrice: order.totalPrice,
        status: order.status,
        sellerName: order.items[0]?.product?.seller?.user?.name || 'Unknown',
        itemCount: order.items.length,
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      })),
      totalAmount: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      totalOrders: orders.length,
      sellersInvolved: new Set(
        orders.flatMap((order) =>
          order.items.map((item) => item.product.seller.id),
        ),
      ).size,
    };

    return summary;
  }

  /**
   * Xử lý payment success cho multiple orders
   */
  async handleMultipleOrdersPaid(orderIds: number[]): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      this.logger.log(`💳 Processing payment success for orders: ${orderIds.join(', ')}`);

      for (const orderId of orderIds) {
        // Lấy order với items
        const order = await manager.findOne(Order, {
          where: { id: orderId },
          relations: ['items', 'items.product'],
        });

        if (!order) {
          this.logger.error(`Order ${orderId} not found`);
          continue;
        }

        // Cập nhật order status
        await manager.update(Order, orderId, {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        });

        // Trừ stock cho từng product
        for (const item of order.items) {
          const product = await manager.findOne(Product, {
            where: { id: item.productId },
          });

          if (!product) {
            this.logger.error(`Product ${item.productId} not found`);
            continue;
          }

          if (product.stock < item.quantity) {
            this.logger.warn(
              `Insufficient stock for product ${product.id}. Available: ${product.stock}, Required: ${item.quantity}`,
            );
            // Có thể throw error hoặc partial fulfill
            throw new Error(`Không đủ hàng cho sản phẩm ${product.name}`);
          }

          // Trừ stock
          const newStock = product.stock - item.quantity;
          await manager.update(Product, product.id, {
            stock: newStock,
          });

          this.logger.log(
            `📉 Product ${product.name} stock: ${product.stock} → ${newStock} (sold: ${item.quantity})`,
          );
        }

        this.logger.log(`✅ Order ${orderId} processed successfully`);
      }

      this.logger.log(`🎉 All ${orderIds.length} orders processed successfully`);
    });
  }
}
