import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from '../../account/seller/entities/seller.entity';
import { User } from '../../account/user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { CreateSellerDto, UpdateSellerDto } from './dto/seller.dto';
import { OrderStatus } from '../../shared/enums';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  // Tạo seller profile mới
  async createSeller(sellerData: CreateSellerDto): Promise<Seller> {
    // Kiểm tra user có tồn tại không
    const user = await this.userRepository.findOne({ where: { id: parseInt(sellerData.userId) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra user đã có seller profile chưa
    const existingSeller = await this.sellerRepository.findOne({ where: { id: parseInt(sellerData.userId) } });
    if (existingSeller) {
      throw new Error('User already has a seller profile');
    }

    const seller = this.sellerRepository.create({
      id: parseInt(sellerData.userId),
      shopName: sellerData.shopName,
      shopAddress: sellerData.shopAddress,
      shopPhone: sellerData.shopPhone,
      description: sellerData.description,
    });
    return await this.sellerRepository.save(seller);
  }

  // Lấy seller theo ID
  async findOne(sellerId: number): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { id: sellerId },
      relations: ['user', 'products'],
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  // Lấy seller theo User ID
  async findByUserId(userId: number): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { id: userId },
      relations: ['user', 'products'],
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found for this user');
    }

    return seller;
  }

  // ✅ Chỉ lấy thông tin cơ bản seller + user (không load products)
  async findSellerBasicInfo(sellerId: number): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { id: sellerId },
      relations: ['user'], // Chỉ cần user info
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  // ✅ Chỉ lấy seller với products (không cần user info)
  async findSellerWithProducts(sellerId: number): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { id: sellerId },
      relations: ['products'], // Chỉ cần products
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  // Cập nhật thông tin seller
  async updateSeller(sellerId: number, updateData: UpdateSellerDto): Promise<Seller> {
    const seller = await this.findOne(sellerId);
    
    Object.assign(seller, updateData);
    return await this.sellerRepository.save(seller);
  }

  // ✅ Optimized: Lấy tất cả đơn hàng mà seller đã bán với pagination
  async getSellerOrders(
    sellerId: number,
    options: { limit?: number; offset?: number; status?: string } = {}
  ): Promise<{
    sellerId: number;
    orders: any[];
    total: number;
    hasMore: boolean;
  }> {
    const { limit = 20, offset = 0, status } = options;
    
    // Build base query
    let query = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'buyerUser')
      .where('product.sellerId = :sellerId', { sellerId });

    // Add status filter if provided
    if (status) {
      query = query.andWhere('order.status = :status', { status });
    }

    // Get total count for pagination
    const totalQuery = query.clone();
    const distinctOrderIds = await totalQuery
      .select('DISTINCT order.id')
      .getRawMany();
    const total = distinctOrderIds.length;

    // Get paginated results
    const orderItems = await query
      .orderBy('order.createdAt', 'DESC')
      .addOrderBy('orderItem.id', 'ASC')
      .getMany();

    // Group by order and paginate
    const ordersMap = new Map();
    
    orderItems.forEach(item => {
      const orderId = item.order.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          orderId: orderId,
          buyerName: item.order.buyer.user.name,
          buyerPhone: item.order.buyer.user.phone || 'N/A',
          deliveryAddress: item.order.buyer.user.address || 'N/A',
          totalPrice: 0,
          status: item.order.status,
          createdAt: item.order.createdAt,
          paidAt: item.order.paidAt,
          note: item.order.note,
          items: [],
        });
      }

      const order = ordersMap.get(orderId);
      order.totalPrice += Number(item.price) * item.quantity;
      order.items.push({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
      });
    });

    // Convert to array and apply pagination
    const allOrders = Array.from(ordersMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const paginatedOrders = allOrders.slice(offset, offset + limit);

    return {
      sellerId,
      orders: paginatedOrders,
      total,
      hasMore: offset + limit < total,
    };
  }

  // ✅ New: Get seller order statistics
  async getSellerOrderStats(sellerId: number): Promise<{
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: { [key: string]: number };
    avgOrderValue: number;
  }> {
    const [orderStats, statusStats] = await Promise.all([
      // Total orders and revenue
      this.orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoin('orderItem.order', 'order')
        .leftJoin('orderItem.product', 'product')
        .select('COUNT(DISTINCT order.id)', 'totalOrders')
        .addSelect('SUM(orderItem.price * orderItem.quantity)', 'totalRevenue')
        .addSelect('AVG(orderItem.price * orderItem.quantity)', 'avgOrderValue')
        .where('product.sellerId = :sellerId', { sellerId })
        .andWhere('order.status = :status', { status: OrderStatus.PAID })
        .getRawOne(),
      
      // Orders by status
      this.orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoin('orderItem.order', 'order')
        .leftJoin('orderItem.product', 'product')
        .select('order.status', 'status')
        .addSelect('COUNT(DISTINCT order.id)', 'count')
        .where('product.sellerId = :sellerId', { sellerId })
        .groupBy('order.status')
        .getRawMany()
    ]);

    const ordersByStatus = statusStats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalOrders: parseInt(orderStats?.totalOrders || '0'),
      totalRevenue: parseFloat(orderStats?.totalRevenue || '0'),
      avgOrderValue: parseFloat(orderStats?.avgOrderValue || '0'),
      ordersByStatus,
    };
  }
}
