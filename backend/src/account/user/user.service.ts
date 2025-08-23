import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Buyer } from '../buyer/entities/buyer.entity';
import { Seller } from '../seller/entities/seller.entity';
import { SellerStats } from '../../seller-stats/entities/seller-stats.entity';
import { UserRole } from '../../auth/roles.enum';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

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

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      // Tạo user mới
      const user = new User();
      user.name = createUserDto.name;
      user.username = createUserDto.username;
      user.email = createUserDto.email;
      user.role = createUserDto.role;
      user.password = createUserDto.password;
      if (createUserDto.avatar) {
        user.avatar = createUserDto.avatar;
      }

      const savedUser = await manager.save(User, user);

      // Tạo buyer hoặc seller tương ứng
      if (createUserDto.role === UserRole.BUYER) {
        const buyer = manager.create(Buyer, { id: savedUser.id });
        await manager.save(Buyer, buyer);
      } else if (createUserDto.role === UserRole.SELLER) {
        const seller = manager.create(Seller, { id: savedUser.id });
        const savedSeller = await manager.save(Seller, seller);

        // ✅ Tạo SellerStats với giá trị mặc định
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

      // Lấy user với relations để trả về (trong cùng transaction)
      let userWithRelations;
      if (createUserDto.role === UserRole.BUYER) {
        userWithRelations = await manager.findOne(User, {
          where: { id: savedUser.id },
          relations: ['buyer'],
        });
      } else if (createUserDto.role === UserRole.SELLER) {
        userWithRelations = await manager.findOne(User, {
          where: { id: savedUser.id },
          relations: ['seller'],
        });
      } else {
        userWithRelations = savedUser;
      }

      if (!userWithRelations) {
        throw new Error('Failed to retrieve user after creation');
      }
      return new UserResponseDto(userWithRelations);
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByIdWithRelations(id: number): Promise<User | null> {
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

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    // Cập nhật các field được cung cấp
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) user.password = updateUserDto.password;
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.avatar !== undefined) user.avatar = updateUserDto.avatar;

    const updatedUser = await this.userRepository.save(user);
    const userWithRelations = await this.findByIdWithRelations(updatedUser.id);
    if (!userWithRelations) {
      throw new Error('Failed to retrieve user after update');
    }
    return new UserResponseDto(userWithRelations);
  }

  // ✅ Xóa user với cascade deletion
  async deleteUser(id: number): Promise<{ message: string }> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      // Xóa các bản ghi liên quan dựa trên role
      if (user.role === UserRole.BUYER) {
        const buyer = await manager.findOne(Buyer, { where: { id } });
        if (buyer) {
          // Xóa các favorites, orders, reviews của buyer
          await manager.delete('Favorite', { buyerId: buyer.id });
          await manager.delete('Review', { userId: id });
          // Note: Orders thường không xóa để giữ lại lịch sử
          await manager.delete(Buyer, { id: buyer.id });
        }
      } else if (user.role === UserRole.SELLER) {
        const seller = await manager.findOne(Seller, { where: { id } });
        if (seller) {
          // Xóa seller stats
          await manager.delete(SellerStats, { id: seller.id });
          // Note: Products thường không xóa để giữ lại lịch sử
          // hoặc có thể chuyển sang trạng thái "discontinued"
          await manager.delete(Seller, { id: seller.id });
        }
      }

      // Cuối cùng xóa user
      await manager.delete(User, { id });

      return { message: 'User deleted successfully' };
    });
  }
}
