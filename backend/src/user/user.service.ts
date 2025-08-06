import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Buyer } from './entities/buyer.entity';
import { Seller } from './entities/seller.entity';
import { UserRole } from '../auth/roles.enum';
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
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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
    
    const savedUser = await this.userRepository.save(user);

    // Tạo buyer hoặc seller tương ứng
    if (createUserDto.role === UserRole.BUYER) {
      const buyer = this.buyerRepository.create({ userId: savedUser.id });
      await this.buyerRepository.save(buyer);
    } else if (createUserDto.role === UserRole.SELLER) {
      const seller = this.sellerRepository.create({ userId: savedUser.id });
      await this.sellerRepository.save(seller);
    }

    // Lấy user với relations để trả về
    const userWithRelations = await this.findByIdWithRelations(savedUser.id);
    return new UserResponseDto(userWithRelations);
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
      relations
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
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
    return new UserResponseDto(userWithRelations);
  }
}
