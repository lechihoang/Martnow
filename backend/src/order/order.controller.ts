import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity';
import { Buyer } from '../entity/buyer.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/roles.enum';

@Controller('orders')
export class OrderController {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Buyer)
    private readonly buyerRepository: Repository<Buyer>,
  ) {}

  // Chỉ buyer mới có thể tạo đơn hàng
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async createOrder(@Body() createOrderDto: any, @Req() req: any) {
    const buyer = await this.buyerRepository.findOne({ 
      where: { userId: req.user.userId } 
    });
    
    const order = this.orderRepository.create({
      ...createOrderDto,
      buyer: buyer,
    });
    return await this.orderRepository.save(order);
  }

  // Buyer có thể xem đơn hàng của mình, Seller có thể xem đơn hàng có sản phẩm của mình
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async getOrders(@Req() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole === UserRole.BUYER) {
      // Buyer chỉ xem được đơn hàng của mình
      const buyer = await this.buyerRepository.findOne({ 
        where: { userId: userId } 
      });
      
      if (!buyer) {
        return [];
      }
      
      return this.orderRepository.find({
        where: { buyer: { id: buyer.id } },
        relations: ['items', 'items.product'],
      });
    } else if (userRole === UserRole.SELLER) {
      // Seller xem được đơn hàng có chứa sản phẩm của mình
      return this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('product.seller', 'seller')
        .where('seller.userId = :userId', { userId })
        .getMany();
    }
  }
}
