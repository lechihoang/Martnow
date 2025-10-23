import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Buyer } from '../buyer/entities/buyer.entity';
import { Seller } from '../seller/entities/seller.entity';
import { SellerStats } from '../../seller-stats/entities/seller-stats.entity';
import { UserRole } from '../../lib/supabase';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';

interface CreateUserData {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(SellerStats)
    private sellerStatsRepository: Repository<SellerStats>,
    private dataSource: DataSource,
  ) {}

  async findBySupabaseId(supabaseId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: supabaseId } });
  }

  async create(createUserDto: CreateUserData): Promise<User> {
    return await this.dataSource.transaction(async (manager) => {
      // Check if user already exists
      const existingUser = await manager.findOne(User, {
        where: { id: createUserDto.id },
      });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser = new User();
      newUser.id = createUserDto.id;
      newUser.email = createUserDto.email;
      newUser.name = createUserDto.name;
      newUser.username = createUserDto.username;
      newUser.role = createUserDto.role;

      const savedUser = await manager.save(User, newUser);

      // Create buyer or seller based on role
      if (newUser.role === UserRole.BUYER) {
        const buyer = manager.create(Buyer, { id: savedUser.id });
        await manager.save(Buyer, buyer);
      } else if (newUser.role === UserRole.SELLER) {
        const seller = manager.create(Seller, { id: savedUser.id });
        const savedSeller = await manager.save(Seller, seller);

        // Create SellerStats
        const sellerStats = manager.create(SellerStats, {
          id: savedSeller.id,
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          pendingOrders: 0,
          completedOrders: 0,
          averageRating: 0,
          totalReviews: 0,
        });
        await manager.save(SellerStats, sellerStats);
      }

      return savedUser;
    });
  }

  async findByIdWithRelations(id: string): Promise<User | null> {
    // Đầu tiên tìm user để biết role
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    // Dựa vào role để load relation tương ứng
    const relations: string[] = [];
    if (user.role === UserRole.BUYER) {
      relations.push('buyer');
    } else if (user.role === UserRole.SELLER) {
      relations.push('seller');
    }

    return this.userRepository.findOne({
      where: { id },
      relations,
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      const oldRole = user.role;
      const newRole = updateUserDto.role;

      // Cập nhật các field được cung cấp
      if (updateUserDto.name) user.name = updateUserDto.name;
      if (updateUserDto.username) user.username = updateUserDto.username;
      if (updateUserDto.email) user.email = updateUserDto.email;
      if (updateUserDto.role) user.role = updateUserDto.role;
      if (updateUserDto.avatar !== undefined)
        user.avatar = updateUserDto.avatar;
      if (updateUserDto.address !== undefined)
        user.address = updateUserDto.address;
      if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;

      // Handle role change
      if (newRole && oldRole !== newRole) {
        // Delete old role entity
        if (oldRole === UserRole.BUYER) {
          await manager.delete(Buyer, { id: user.id });
        } else if (oldRole === UserRole.SELLER) {
          await manager.delete(SellerStats, { id: user.id });
          await manager.delete(Seller, { id: user.id });
        }

        // Create new role entity
        if (newRole === UserRole.BUYER) {
          const buyer = manager.create(Buyer, { id: user.id });
          await manager.save(Buyer, buyer);
        } else if (newRole === UserRole.SELLER) {
          const seller = manager.create(Seller, { id: user.id });
          const savedSeller = await manager.save(Seller, seller);

          // Create SellerStats
          const sellerStats = manager.create(SellerStats, {
            id: savedSeller.id,
            totalOrders: 0,
            totalRevenue: 0,
            totalProducts: 0,
            pendingOrders: 0,
            completedOrders: 0,
            averageRating: 0,
            totalReviews: 0,
          });
          await manager.save(SellerStats, sellerStats);
        }
      }

      const updatedUser = await manager.save(User, user);
      const userWithRelations = await this.findByIdWithRelations(
        updatedUser.id,
      );
      if (!userWithRelations) {
        throw new Error('Failed to retrieve user after update');
      }
      return new UserResponseDto(userWithRelations);
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}
