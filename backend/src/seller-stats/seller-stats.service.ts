import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerStats } from './entities/seller-stats.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { SellerStatsDto } from './dto/seller-stats.dto';
import { OrderStatus } from '../shared/enums';

@Injectable()
export class SellerStatsService {
  constructor(
    @InjectRepository(SellerStats)
    private sellerStatsRepository: Repository<SellerStats>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getSellerStats(sellerId: string): Promise<SellerStatsDto> {
    try {
      // Tính tổng số đơn hàng của seller
      const totalOrders = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.items', 'orderItem')
        .innerJoin('orderItem.product', 'product')
        .where('product.sellerId = :sellerId', { sellerId: parseInt(sellerId) })
        .getCount();

      // Tính tổng doanh thu
      const revenueResult = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalPrice)', 'totalRevenue')
        .innerJoin('order.items', 'orderItem')
        .innerJoin('orderItem.product', 'product')
        .where('product.sellerId = :sellerId', { sellerId: parseInt(sellerId) })
        .andWhere('order.status = :status', { status: OrderStatus.PAID })
        .getRawOne();

      const totalRevenue = parseFloat(revenueResult.totalRevenue) || 0;

      // Tính tổng số sản phẩm
      const totalProducts = await this.productRepository
        .count({ where: { sellerId: parseInt(sellerId) } });

      // Tính số đơn hàng đang chờ xử lý
      const pendingOrders = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.items', 'orderItem')
        .innerJoin('orderItem.product', 'product')
        .where('product.sellerId = :sellerId', { sellerId: parseInt(sellerId) })
        .andWhere('order.status = :status', { status: OrderStatus.WAITING_PAYMENT })
        .getCount();

      // Lưu hoặc cập nhật thống kê
      let stats = await this.sellerStatsRepository.findOne({
        where: { id: parseInt(sellerId) }
      });

      if (stats) {
        stats.totalOrders = totalOrders;
        stats.totalRevenue = totalRevenue;
        stats.totalProducts = totalProducts;
        stats.pendingOrders = pendingOrders;
      } else {
        stats = this.sellerStatsRepository.create({
          id: parseInt(sellerId),
          totalOrders,
          totalRevenue,
          totalProducts,
          pendingOrders,
        });
      }

      await this.sellerStatsRepository.save(stats);

      return new SellerStatsDto({
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        completedOrders: totalOrders - pendingOrders,
        averageRating: 0,
        totalReviews: 0,
        sellerId
      });
    } catch (error) {
      console.error('Error calculating seller stats:', error);
      return new SellerStatsDto({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageRating: 0,
        totalReviews: 0,
        sellerId
      });
    }
  }

  async updateSellerStats(sellerId: string): Promise<void> {
    await this.getSellerStats(sellerId);
  }
}
