import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerStats } from '../user/entities/seller-stats.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { SellerStatsDto } from '../user/dto/seller-stats.dto';

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

  async getSellerStats(sellerId: number): Promise<SellerStatsDto> {
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
        .andWhere('order.status = :status', { status: 'delivered' })
        .getRawOne();

      const totalRevenue = parseFloat(revenueResult.totalRevenue) || 0;

      // Tính tổng số sản phẩm
      const totalProducts = await this.productRepository
        .count({ where: { sellerId } });

      // Tính số đơn hàng đang chờ xử lý
      const pendingOrders = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.items', 'orderItem')
        .innerJoin('orderItem.product', 'product')
        .where('product.sellerId = :sellerId', { sellerId })
        .andWhere('order.status = :status', { status: 'pending' })
        .getCount();

      // Lưu hoặc cập nhật thống kê
      let stats = await this.sellerStatsRepository.findOne({
        where: { sellerId }
      });

      if (stats) {
        stats.totalOrders = totalOrders;
        stats.totalRevenue = totalRevenue;
        stats.totalProducts = totalProducts;
        stats.pendingOrders = pendingOrders;
        stats.updatedAt = new Date();
      } else {
        stats = this.sellerStatsRepository.create({
          sellerId,
          totalOrders,
          totalRevenue,
          totalProducts,
          pendingOrders,
        });
      }

      await this.sellerStatsRepository.save(stats);

      return new SellerStatsDto(totalOrders, totalRevenue, totalProducts, pendingOrders);
    } catch (error) {
      console.error('Error calculating seller stats:', error);
      return new SellerStatsDto();
    }
  }

  async updateSellerStats(sellerId: number): Promise<void> {
    await this.getSellerStats(sellerId);
  }
}
