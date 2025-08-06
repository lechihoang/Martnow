import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { Category } from './product/entities/category.entity';
import { Product } from './product/entities/product.entity';
import { User } from './user/entities/user.entity';
import { Seller } from './user/entities/seller.entity';
import { Buyer } from './user/entities/buyer.entity';
import { SellerStats } from './user/entities/seller-stats.entity';
import { UserRole } from './auth/roles.enum';
import { getRepositoryToken } from '@nestjs/typeorm';

// Categories data từ frontend
const categories = [
  { id: 1, name: 'Bánh mì', description: 'Các loại bánh mì truyền thống và hiện đại' },
  { id: 2, name: 'Đồ uống', description: 'Nước uống, trà, cà phê' },
  { id: 3, name: 'Bánh ngọt', description: 'Bánh kem, bánh bông lan, bánh su kem' },
  { id: 4, name: 'Món chính', description: 'Cơm, phở, bún' },
  { id: 5, name: 'Snack', description: 'Đồ ăn vặt, kẹo, bánh quy' }
];

// Product data từ frontend
const productData = [
  // Bánh mì
  { name: 'Bánh mì thịt nướng', description: 'Bánh mì thịt nướng thơm ngon, ăn kèm rau sống', price: 25000, categoryId: 1, stock: 50 },
  { name: 'Bánh mì pate', description: 'Bánh mì pate truyền thống với chả lụa', price: 20000, categoryId: 1, stock: 40 },
  { name: 'Bánh mì chả cá', description: 'Bánh mì chả cá Nha Trang đặc biệt', price: 30000, categoryId: 1, stock: 35 },
  { name: 'Bánh mì xíu mại', description: 'Bánh mì xíu mại sốt cà chua', price: 28000, categoryId: 1, stock: 45 },
  
  // Đồ uống
  { name: 'Trà sữa trân châu', description: 'Trà sữa trân châu đường đen thơm ngon', price: 35000, categoryId: 2, stock: 60 },
  { name: 'Cà phê đen đá', description: 'Cà phê phin truyền thống', price: 15000, categoryId: 2, stock: 80 },
  { name: 'Nước chanh dây', description: 'Nước chanh dây tươi mát', price: 18000, categoryId: 2, stock: 50 },
  { name: 'Sinh tố bơ', description: 'Sinh tố bơ béo ngậy', price: 25000, categoryId: 2, stock: 30 },
  
  // Bánh ngọt
  { name: 'Bánh flan', description: 'Bánh flan caramel mềm mịn', price: 12000, categoryId: 3, stock: 25 },
  { name: 'Bánh tiramisu', description: 'Bánh tiramisu Ý chính hiệu', price: 45000, categoryId: 3, stock: 20 },
  { name: 'Bánh red velvet', description: 'Bánh red velvet với cream cheese', price: 38000, categoryId: 3, stock: 15 },
  { name: 'Bánh chocolate lava', description: 'Bánh chocolate lava nóng hổi', price: 32000, categoryId: 3, stock: 18 },
  
  // Món chính
  { name: 'Cơm tấm sườn nướng', description: 'Cơm tấm sườn nướng đặc biệt', price: 55000, categoryId: 4, stock: 40 },
  { name: 'Phở bò tái', description: 'Phở bò tái truyền thống Hà Nội', price: 50000, categoryId: 4, stock: 35 },
  { name: 'Bún bò Huế', description: 'Bún bò Huế cay nồng đậm đà', price: 48000, categoryId: 4, stock: 30 },
  { name: 'Cơm gà Hải Nam', description: 'Cơm gà Hải Nam thơm ngon', price: 52000, categoryId: 4, stock: 25 },
  
  // Snack
  { name: 'Bánh tráng nướng', description: 'Bánh tráng nướng Đà Lạt', price: 8000, categoryId: 5, stock: 100 },
  { name: 'Chè thái', description: 'Chè thái nhiều màu sắc', price: 22000, categoryId: 5, stock: 40 },
  { name: 'Bánh xèo mini', description: 'Bánh xèo mini giòn rụm', price: 15000, categoryId: 5, stock: 60 },
  { name: 'Nem nướng Nha Trang', description: 'Nem nướng Nha Trang chấm tương', price: 35000, categoryId: 5, stock: 45 }
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryRepository = app.get<Repository<Category>>(getRepositoryToken(Category));
  const productRepository = app.get<Repository<Product>>(getRepositoryToken(Product));
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const sellerRepository = app.get<Repository<Seller>>(getRepositoryToken(Seller));
  const buyerRepository = app.get<Repository<Buyer>>(getRepositoryToken(Buyer));
  const sellerStatsRepository = app.get<Repository<SellerStats>>(getRepositoryToken(SellerStats));

  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Tạo Categories
    console.log('📂 Creating categories...');
    for (const categoryData of categories) {
      const existingCategory = await categoryRepository.findOne({ where: { name: categoryData.name } });
      if (!existingCategory) {
        const category = categoryRepository.create({
          name: categoryData.name,
          description: categoryData.description
        });
        await categoryRepository.save(category);
        console.log(`   ✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`   ℹ️ Category already exists: ${categoryData.name}`);
      }
    }

    // 2. Tạo Buyer User
    console.log('\n👤 Creating buyer user...');
    const existingBuyerUser = await userRepository.findOne({ where: { username: 'buyer_an' } });
    let buyerUser;
    
    if (!existingBuyerUser) {
      buyerUser = userRepository.create({
        name: 'Nguyễn Văn An',
        username: 'buyer_an',
        email: 'buyer@foodee.com',
        password: 'password123', // Note: In production, hash this password
        role: UserRole.BUYER,
        avatar: '/images/avatars/buyer-avatar.jpg'
      });
      buyerUser = await userRepository.save(buyerUser);
      console.log('   ✅ Created buyer user: buyer_an');
    } else {
      buyerUser = existingBuyerUser;
      console.log('   ℹ️ Buyer user already exists: buyer_an');
    }

    // 3. Tạo Buyer Profile
    const existingBuyer = await buyerRepository.findOne({ where: { userId: buyerUser.id } });
    if (!existingBuyer) {
      const buyer = buyerRepository.create({
        userId: buyerUser.id,
      });
      await buyerRepository.save(buyer);
      console.log('   ✅ Created buyer profile');
    } else {
      console.log('   ℹ️ Buyer profile already exists');
    }

    // 4. Tạo Seller User
    console.log('\n🏪 Creating seller user...');
    const existingSellerUser = await userRepository.findOne({ where: { username: 'seller_binh' } });
    let sellerUser;
    
    if (!existingSellerUser) {
      sellerUser = userRepository.create({
        name: 'Trần Thị Bình',
        username: 'seller_binh',
        email: 'seller@foodee.com',
        password: 'password123', // Note: In production, hash this password
        role: UserRole.SELLER,
        avatar: '/images/avatars/seller-avatar.jpg'
      });
      sellerUser = await userRepository.save(sellerUser);
      console.log('   ✅ Created seller user: seller_binh');
    } else {
      sellerUser = existingSellerUser;
      console.log('   ℹ️ Seller user already exists: seller_binh');
    }

    // 5. Tạo Seller Profile
    const existingSeller = await sellerRepository.findOne({ where: { userId: sellerUser.id } });
    let seller;
    
    if (!existingSeller) {
      seller = sellerRepository.create({
        userId: sellerUser.id,
        shopName: 'Quán Ăn Ngon Bình',
        shopAddress: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        shopPhone: '0901234567',
        description: 'Quán ăn gia đình với các món ăn truyền thống Việt Nam. Được thành lập từ năm 2020, chúng tôi luôn cam kết mang đến những món ăn chất lượng, tươi ngon với giá cả hợp lý.'
      });
      seller = await sellerRepository.save(seller);
      console.log('   ✅ Created seller profile: Quán Ăn Ngon Bình');
    } else {
      seller = existingSeller;
      console.log('   ℹ️ Seller profile already exists: Quán Ăn Ngon Bình');
    }

    // 6. Tạo 20 Products cho Seller
    console.log('\n🍽️ Creating 20 products for seller...');
    let productCount = 0;
    
    // Mapping categoryId từ seed data sang tên category
    const categoryMapping = {
      1: 'Bánh mì',
      2: 'Đồ uống', 
      3: 'Bánh ngọt',
      4: 'Món chính',
      5: 'Snack'
    };
    
    for (let i = 0; i < productData.length; i++) {
      const data = productData[i];
      const existingProduct = await productRepository.findOne({ 
        where: { name: data.name, sellerId: seller.id } 
      });
      
      if (!existingProduct) {
        // Tìm category thực tế trong database
        const categoryName = categoryMapping[data.categoryId];
        const category = await categoryRepository.findOne({ where: { name: categoryName } });
        
        if (!category) {
          console.log(`   ❌ Category not found: ${categoryName}`);
          continue;
        }
        
        const product = productRepository.create({
          sellerId: seller.id,
          categoryId: category.id,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: `/images/products/product-${i + 1}.jpg`,
          isAvailable: true,
          stock: data.stock,
          discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : undefined // 30% chance of discount, undefined if no discount
        });
        
        await productRepository.save(product);
        productCount++;
        console.log(`   📦 Product ${i + 1}/20: ${product.name} - ${product.price.toLocaleString('vi-VN')}đ`);
      } else {
        console.log(`   ℹ️ Product already exists: ${data.name}`);
      }
    }

    // 7. Tạo/Cập nhật Seller Stats
    console.log('\n📊 Creating seller stats...');
    const existingStats = await sellerStatsRepository.findOne({ where: { sellerId: seller.id } });
    
    if (!existingStats) {
      const stats = sellerStatsRepository.create({
        sellerId: seller.id,
        totalOrders: Math.floor(Math.random() * 50) + 10,
        totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
        totalProducts: productCount,
        pendingOrders: Math.floor(Math.random() * 5),
        completedOrders: Math.floor(Math.random() * 45) + 5,
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
        totalReviews: Math.floor(Math.random() * 50) + 10
      });
      
      await sellerStatsRepository.save(stats);
      console.log('   ✅ Created seller stats');
    } else {
      // Cập nhật total products
      existingStats.totalProducts = productCount;
      await sellerStatsRepository.save(existingStats);
      console.log('   ✅ Updated seller stats');
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Categories created: ${categories.length}`);
    console.log(`   • Users created: 2 (1 buyer, 1 seller)`);
    console.log(`   • Products created: ${productCount}`);
    console.log(`   • Seller stats updated`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }

  await app.close();
  console.log('\n🎉 Backend seed completed! You can now start the server.');
}

seed().catch(console.error);
