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
  role: UserRole;
  avatar?: string;
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
      newUser.role = createUserDto.role;
      if (createUserDto.avatar) {
        newUser.avatar = createUserDto.avatar;
      }

      // Create buyer or seller based on role and use cascade
      if (newUser.role === UserRole.BUYER) {
        const buyer = new Buyer();
        buyer.id = newUser.id;
        newUser.buyer = buyer; // Cascade will save this
      } else if (newUser.role === UserRole.SELLER) {
        const seller = new Seller();
        seller.id = newUser.id;

        // Create SellerStats with cascade
        const sellerStats = new SellerStats();
        sellerStats.id = seller.id;
        sellerStats.totalOrders = 0;
        sellerStats.totalRevenue = 0;
        sellerStats.totalProducts = 0;
        sellerStats.pendingOrders = 0;
        sellerStats.completedOrders = 0;
        sellerStats.averageRating = 0;
        sellerStats.totalReviews = 0;

        seller.stats = sellerStats; // Cascade will save this
        newUser.seller = seller; // Cascade will save this
      }

      // Single save - cascade will handle buyer/seller/stats
      const savedUser = await manager.save(User, newUser);
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
    // Simple update - no transaction needed
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    // Cập nhật các field được cung cấp (username, email, role không thể thay đổi)
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.avatar !== undefined) user.avatar = updateUserDto.avatar;
    if (updateUserDto.address !== undefined)
      user.address = updateUserDto.address;
    if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;

    // Save and return with relations
    await this.userRepository.save(user);

    const userWithRelations = await this.findByIdWithRelations(id);
    if (!userWithRelations) {
      throw new Error('Failed to retrieve user after update');
    }

    return new UserResponseDto(userWithRelations);
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
