import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from '../user/entities/seller.entity';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { CreateSellerDto, UpdateSellerDto } from '../user/dto/seller.dto';

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
    const user = await this.userRepository.findOne({ where: { id: sellerData.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra user đã có seller profile chưa
    const existingSeller = await this.sellerRepository.findOne({ where: { userId: sellerData.userId } });
    if (existingSeller) {
      throw new Error('User already has a seller profile');
    }

    const seller = this.sellerRepository.create(sellerData);
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
      where: { userId },
      relations: ['user', 'products'],
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found for this user');
    }

    return seller;
  }

  // Cập nhật thông tin seller
  async updateSeller(sellerId: number, updateData: UpdateSellerDto): Promise<Seller> {
    const seller = await this.findOne(sellerId);
    
    Object.assign(seller, updateData);
    return await this.sellerRepository.save(seller);
  }

  // Lấy tất cả đơn hàng mà seller đã bán (thông qua sản phẩm)
  async getSellerOrders(sellerId: number): Promise<any> {
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
    
    orderItems.forEach(item => {
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

      const order = ordersMap.get(orderId);
      order.totalPrice += item.price * item.quantity;
      order.items.push({
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
}
