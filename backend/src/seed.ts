import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { Category } from './product/entities/category.entity';
import { User } from './user/entities/user.entity';
import { Seller } from './user/entities/seller.entity';
import { Buyer } from './user/entities/buyer.entity';
import { SellerStats } from './user/entities/seller-stats.entity';
import { UserRole } from './auth/roles.enum';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryRepository = app.get<Repository<Category>>(getRepositoryToken(Category));
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const sellerRepository = app.get<Repository<Seller>>(getRepositoryToken(Seller));
  const buyerRepository = app.get<Repository<Buyer>>(getRepositoryToken(Buyer));
  const sellerStatsRepository = app.get<Repository<SellerStats>>(getRepositoryToken(SellerStats));

  // Tạo category mặc định
  const existingCategory = await categoryRepository.findOne({ where: { id: 1 } });
  if (!existingCategory) {
    const defaultCategory = categoryRepository.create({
      id: 1,
      name: 'Món ăn',
      description: 'Danh mục món ăn mặc định',
    });
    await categoryRepository.save(defaultCategory);
    console.log('✅ Created default category');
  } else {
    console.log('ℹ️ Default category already exists');
  }

  // Tạo user seller mặc định
  const existingSellerUser = await userRepository.findOne({ where: { id: 1 } });
  if (!existingSellerUser) {
    const defaultSellerUser = userRepository.create({
      id: 1,
      name: 'Default Seller',
      username: 'defaultseller',
      email: 'seller@example.com',
      password: 'password123',
      role: UserRole.SELLER,
    });
    await userRepository.save(defaultSellerUser);
    console.log('✅ Created default seller user');
  } else {
    console.log('ℹ️ Default seller user already exists');
  }

  // Tạo seller mặc định
  const existingSeller = await sellerRepository.findOne({ where: { id: 1 } });
  if (!existingSeller) {
    const defaultSeller = sellerRepository.create({
      userId: 1,
      shopName: 'Default Shop',
      description: 'Cửa hàng mặc định',
      shopAddress: '123 Main Street, District 1',
      shopPhone: '0123456789',
    });
    await sellerRepository.save(defaultSeller);
    console.log('✅ Created default seller');

    // Tạo seller stats mặc định
    const defaultSellerStats = sellerStatsRepository.create({
      sellerId: 1,
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      pendingOrders: 0,
      completedOrders: 0,
      averageRating: 0,
      totalReviews: 0,
    });
    await sellerStatsRepository.save(defaultSellerStats);
    console.log('✅ Created default seller stats');
  } else {
    console.log('ℹ️ Default seller already exists');
  }

  // Tạo user buyer mặc định
  const existingBuyerUser = await userRepository.findOne({ where: { id: 2 } });
  if (!existingBuyerUser) {
    const defaultBuyerUser = userRepository.create({
      id: 2,
      name: 'Default Buyer',
      username: 'defaultbuyer',
      email: 'buyer@example.com',
      password: 'password123',
      role: UserRole.BUYER,
    });
    await userRepository.save(defaultBuyerUser);
    console.log('✅ Created default buyer user');
  } else {
    console.log('ℹ️ Default buyer user already exists');
  }

  // Tạo buyer mặc định
  const existingBuyer = await buyerRepository.findOne({ where: { id: 1 } });
  if (!existingBuyer) {
    const defaultBuyer = buyerRepository.create({
      userId: 2,
    });
    await buyerRepository.save(defaultBuyer);
    console.log('✅ Created default buyer');
  } else {
    console.log('ℹ️ Default buyer already exists');
  }

  await app.close();
  console.log('🎉 Seed completed!');
}

seed().catch(console.error);
