import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Buyer } from '../entity/buyer.entity';
import { Seller } from '../entity/seller.entity';

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

  async createUser(name: string, username: string, email: string, role: string, password: string): Promise<User> {
    // Tạo user
    const user = this.userRepository.create({ name, username, email, role, password });
    const savedUser = await this.userRepository.save(user);

    // Tạo buyer hoặc seller tương ứng
    if (role === 'buyer') {
      const buyer = this.buyerRepository.create({ userId: savedUser.id });
      await this.buyerRepository.save(buyer);
    } else if (role === 'seller') {
      // Chỉ truyền userId, các trường khác có thể bổ sung sau
      const seller = this.sellerRepository.create({ userId: savedUser.id });
      await this.sellerRepository.save(seller);
    }

    return savedUser;
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
}
