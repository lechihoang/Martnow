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
        .where('product.sellerId = :sellerId', { sellerId })
        .getCount();

      // Tính tổng doanh thu
      const revenueResult = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalPrice)', 'totalRevenue')
        .innerJoin('order.items', 'orderItem')
        .innerJoin('orderItem.product', 'product')
        .where('product.sellerId = :sellerId', { sellerId })
        .andWhere('order.status = :status', { status: OrderStatus.PAID })
        .getRawOne();

      
      const totalRevenue = parseFloat(revenueResult?.totalRevenue ?? '0') || 0;

      // Tính tổng số sản phẩm
      const totalProducts = await this.productRepository.count({
        where: { sellerId },
      });

      // Bỏ logic pending orders vì không có waiting_payment status
      const pendingOrders = 0;

      // Lưu hoặc cập nhật thống kê
      let stats = await this.sellerStatsRepository.findOne({
        where: { id: sellerId },
      });

      if (stats) {
        stats.totalOrders = totalOrders;
        stats.totalRevenue = totalRevenue;
        stats.totalProducts = totalProducts;
        stats.pendingOrders = pendingOrders;
      } else {
        stats = this.sellerStatsRepository.create({
          id: sellerId,
          totalOrders,
          totalRevenue,
          totalProducts,
          pendingOrders,
        });
      }

      await this.sellerStatsRepository.save(stats);

      return new SellerStatsDto({
        id: sellerId,
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        completedOrders: totalOrders - pendingOrders,
        averageRating: 0,
        totalReviews: 0,
      } as SellerStats);
    } catch (error) {
      console.error('Error calculating seller stats:', error);
      return new SellerStatsDto({
        id: sellerId,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageRating: 0,
        totalReviews: 0,
      } as SellerStats);
    }
  }

  async updateSellerStats(sellerId: string): Promise<void> {
    await this.getSellerStats(sellerId);
  }
}
