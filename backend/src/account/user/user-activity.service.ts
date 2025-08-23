import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Buyer } from '../buyer/entities/buyer.entity';
import { Seller } from '../seller/entities/seller.entity';
import { Review } from '../../review/entities/review.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
// import { UserReviewsDto, BuyerOrdersDto, SellerOrdersDto } from './dto/user-activity.dto';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  // Lấy tất cả reviews của một user (thông qua buyer.id)
  async getUserReviews(userId: number): Promise<any> {
    // Tìm buyer theo id (chính là userId)
    const buyer = await this.buyerRepository.findOne({
      where: { id: userId },
    });

    if (!buyer) {
      return { userId, reviews: [] };
    }

    const reviews = await this.reviewRepository.find({
      where: { buyerId: buyer.id },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    return {
      userId,
      reviews: reviews.map((review) => ({
        productId: review.productId,
        productName: review.product.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
    };
  }

  // Lấy tất cả đơn hàng của user (role buyer)
  async getUserOrders(userId: number): Promise<any> {
    // Tìm buyer theo id (chính là userId)
    const buyer = await this.buyerRepository.findOne({
      where: { id: userId },
    });

    if (!buyer) {
      return { userId, orders: [] };
    }

    const orders = await this.orderRepository.find({
      where: { buyerId: buyer.id },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });

    return {
      userId,
      buyerId: buyer.id,
      orders: orders.map((order) => ({
        id: order.id,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.items ? order.items.length : 0,
        items: order.items
          ? order.items.map((item) => ({
              productId: item.productId,
              productName: item.product ? item.product.name : 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
            }))
          : [],
      })),
    };
  }

  // Lấy tất cả đơn hàng mà user (role seller) đã bán
  async getUserSales(userId: number): Promise<any> {
    // Tìm seller theo id (chính là userId)
    const seller = await this.sellerRepository.findOne({
      where: { id: userId },
    });

    if (!seller) {
      return { userId, orders: [] };
    }

    // Query để lấy tất cả order items có sản phẩm thuộc về seller này
    const orderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'buyerUser')
      .where('product.sellerId = :sellerId', { sellerId: seller.id })
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    // Nhóm các order items theo orderId
    const ordersMap = new Map();

    orderItems.forEach((item) => {
      const orderId = item.order.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          orderId: orderId,
          buyerName: item.order.buyer.user.name,
          totalPrice: 0,
          status: item.order.status,
          createdAt: item.order.createdAt,
          items: [],
        });
      }

      const orderData = ordersMap.get(orderId);
      orderData.totalPrice += Number(item.price) * item.quantity;
      orderData.items.push({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      });
    });

    return {
      userId,
      sellerId: seller.id,
      orders: Array.from(ordersMap.values()),
    };
  }

  // Legacy method - giữ để backward compatibility
  async getSellerOrders(sellerId: number): Promise<any> {
    console.warn(
      'Deprecated method: getSellerOrders. Use getUserSales instead.',
    );

    // Query để lấy tất cả order items có sản phẩm thuộc về seller này
    const orderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'buyerUser')
      .where('product.sellerId = :sellerId', { sellerId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    // Nhóm các order items theo orderId
    const ordersMap = new Map();

    orderItems.forEach((item) => {
      const orderId = item.order.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          orderId: orderId,
          buyerName: item.order.buyer.user.name,
          totalPrice: 0,
          status: item.order.status,
          createdAt: item.order.createdAt,
          items: [],
        });
      }

      const orderData = ordersMap.get(orderId);
      orderData.totalPrice += Number(item.price) * item.quantity;
      orderData.items.push({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      });
    });

    return {
      sellerId,
      orders: Array.from(ordersMap.values()),
    };
  }

  // Lấy thông tin tổng quát của user (bao gồm cả buyer và seller nếu có)
  async getUserProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['buyer', 'seller'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const profile: any = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    // Nếu user là buyer
    if (user.buyer) {
      profile.buyerInfo = {
        id: user.buyer.id,
      };
    }

    // Nếu user là seller
    if (user.seller) {
      profile.sellerInfo = {
        id: user.seller.id,
        shopName: user.seller.shopName,
        shopAddress: user.seller.shopAddress,
        shopPhone: user.seller.shopPhone,
        description: user.seller.description,
      };
    }

    return profile;
  }
}
