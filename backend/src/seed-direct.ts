import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './account/user/entities/user.entity';
import { Buyer } from './account/buyer/entities/buyer.entity';
import { Seller } from './account/seller/entities/seller.entity';
import { Category } from './product/entities/category.entity';
import { Product } from './product/entities/product.entity';
import { SellerStats } from './seller-stats/entities/seller-stats.entity';
import { Review } from './review/entities/review.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Favorite } from './favorite/entities/favorite.entity';
import { MediaFile } from './media/entities/media-file.entity';
import { UserRole } from './auth/roles.enum';
import * as bcrypt from 'bcrypt';

config();

const CATEGORIES = [
  { name: 'Bánh mì', description: 'Các loại bánh mì truyền thống và hiện đại' },
  { name: 'Đồ uống', description: 'Nước uống, trà, cà phê' },
  { name: 'Bánh ngọt', description: 'Bánh kem, bánh bông lan, bánh su kem' },
  { name: 'Món chính', description: 'Cơm, phở, bún' },
  { name: 'Snack', description: 'Đồ ăn vặt, kẹo, bánh quy' }
];

const USERS = [
  {
    name: 'Nguyễn Văn An',
    username: 'buyer_an',
    email: 'buyer@foodee.com',
    role: UserRole.BUYER,
    avatar: '/images/avatars/buyer-avatar.jpg',
    address: '123 Nguyễn Văn Cừ, Phường 3, Quận 5, TP.HCM',
    phone: '0912345678'
  },
  {
    name: 'Trần Thị Bình',
    username: 'seller_binh',
    email: 'seller@foodee.com',
    role: UserRole.SELLER,
    avatar: '/images/avatars/seller-avatar.jpg',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    phone: '0901234567',
    sellerInfo: {
      shopName: 'Quán Ăn Ngon Bình',
      shopAddress: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      shopPhone: '0901234567',
      description: 'Quán ăn gia đình với các món ăn truyền thống Việt Nam.'
    }
  },
  {
    name: 'Lê Văn Cường',
    username: 'buyer_cuong',
    email: 'cuong@foodee.com',
    role: UserRole.BUYER,
    avatar: '/images/avatars/cuong-avatar.jpg',
    address: '456 Trần Hưng Đạo, Phường Bến Nghé, Quận 1, TP.HCM',
    phone: '0987654321'
  },
  {
    name: 'Phạm Thị Dung',
    username: 'seller_dung',
    email: 'dung@foodee.com',
    role: UserRole.SELLER,
    avatar: '/images/avatars/dung-avatar.jpg',
    address: '456 Đường Lê Lợi, Quận 3, TP.HCM',
    phone: '0907654321',
    sellerInfo: {
      shopName: 'Bánh Ngọt Dung',
      shopAddress: '456 Đường Lê Lợi, Quận 3, TP.HCM',
      shopPhone: '0907654321',
      description: 'Chuyên bánh ngọt handmade, bánh sinh nhật và các loại bánh Âu'
    }
  }
];

const PRODUCTS = [
  { name: 'Bánh mì thịt nướng', description: 'Bánh mì thịt nướng thơm ngon, ăn kèm rau sống', price: 25000, categoryName: 'Bánh mì', stock: 50, sellerUsername: 'seller_binh' },
  { name: 'Bánh mì pate', description: 'Bánh mì pate truyền thống với chả lụa', price: 20000, categoryName: 'Bánh mì', stock: 40, sellerUsername: 'seller_binh' },
  { name: 'Bánh mì chả cá', description: 'Bánh mì chả cá Nha Trang đặc biệt', price: 30000, categoryName: 'Bánh mì', stock: 35, sellerUsername: 'seller_binh' },
  { name: 'Trà sữa trân châu', description: 'Trà sữa trân châu đường đen thơm ngon', price: 35000, categoryName: 'Đồ uống', stock: 60, sellerUsername: 'seller_binh' },
  { name: 'Cà phê đen đá', description: 'Cà phê phin truyền thống', price: 15000, categoryName: 'Đồ uống', stock: 80, sellerUsername: 'seller_binh' },
  { name: 'Bánh flan', description: 'Bánh flan caramel mềm mịn', price: 12000, categoryName: 'Bánh ngọt', stock: 25, sellerUsername: 'seller_dung' },
  { name: 'Bánh tiramisu', description: 'Bánh tiramisu Ý chính hiệu', price: 45000, categoryName: 'Bánh ngọt', stock: 20, sellerUsername: 'seller_dung' },
  { name: 'Cơm tấm sườn nướng', description: 'Cơm tấm sườn nướng đặc biệt', price: 55000, categoryName: 'Món chính', stock: 40, sellerUsername: 'seller_binh' },
  { name: 'Phở bò tái', description: 'Phở bò tái truyền thống Hà Nội', price: 50000, categoryName: 'Món chính', stock: 35, sellerUsername: 'seller_binh' },
  { name: 'Bánh tráng nướng', description: 'Bánh tráng nướng Đà Lạt', price: 8000, categoryName: 'Snack', stock: 100, sellerUsername: 'seller_binh' },
];

const seedDirect = async () => {
  console.log('🌱 Starting database seeding (direct mode)...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: false,
    entities: [User, Buyer, Seller, Category, Product, SellerStats, Review, Order, OrderItem, Favorite, MediaFile]
  });

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await dataSource.query('TRUNCATE TABLE "product" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "seller_stats" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "seller" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "buyer" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "category" RESTART IDENTITY CASCADE');
    console.log('✅ Tables cleared');

    console.log('📂 Seeding categories...');
    const categoryRepo = dataSource.getRepository(Category);
    const categories = await categoryRepo.save(CATEGORIES);
    console.log(`✅ Created ${categories.length} categories`);

    console.log('👥 Seeding users...');
    const userRepo = dataSource.getRepository(User);
    const buyerRepo = dataSource.getRepository(Buyer);
    const sellerRepo = dataSource.getRepository(Seller);
    const sellerStatsRepo = dataSource.getRepository(SellerStats);

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (const userData of USERS) {
      // Create user
      const user = userRepo.create({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await userRepo.save(user);
      console.log(`   ✅ Created user: ${savedUser.username} (${savedUser.role})`);

      // Create buyer/seller profile
      if (userData.role === UserRole.BUYER) {
        const buyer = buyerRepo.create({ id: savedUser.id });
        await buyerRepo.save(buyer);
        console.log(`      ↳ Created buyer profile`);
      } else if (userData.role === UserRole.SELLER) {
        const seller = sellerRepo.create({
          id: savedUser.id,
          shopName: userData.sellerInfo?.shopName,
          shopAddress: userData.sellerInfo?.shopAddress,
          shopPhone: userData.sellerInfo?.shopPhone,
          description: userData.sellerInfo?.description
        });
        await sellerRepo.save(seller);
        console.log(`      ↳ Created seller profile: ${userData.sellerInfo?.shopName}`);

        // Create seller stats
        const sellerStats = sellerStatsRepo.create({
          id: savedUser.id,
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          pendingOrders: 0,
          completedOrders: 0,
          averageRating: 0,
          totalReviews: 0
        });
        await sellerStatsRepo.save(sellerStats);
        console.log(`      ↳ Created seller stats`);
      }
    }

    console.log('🍽️ Seeding products...');
    const productRepo = dataSource.getRepository(Product);
    
    for (const productData of PRODUCTS) {
      // Find category
      const category = categories.find(c => c.name === productData.categoryName);
      if (!category) {
        console.log(`   ❌ Category not found: ${productData.categoryName}`);
        continue;
      }

      // Find seller
      const seller = await userRepo.findOne({ 
        where: { username: productData.sellerUsername } 
      });
      if (!seller) {
        console.log(`   ❌ Seller not found: ${productData.sellerUsername}`);
        continue;
      }

      const product = productRepo.create({
        sellerId: seller.id,
        categoryId: category.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        isAvailable: true,
        discount: 0,
        averageRating: 0,
        totalReviews: 0,
        totalSold: 0,
        viewCount: 0
      });

      await productRepo.save(product);
      console.log(`   ✅ Created: ${productData.name}`);
    }

    console.log('📊 Updating seller stats...');
    const sellers = await sellerRepo.find();
    for (const seller of sellers) {
      const productCount = await productRepo.count({ where: { sellerId: seller.id } });
      await sellerStatsRepo.update(seller.id, { totalProducts: productCount });
    }

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('🔑 Default login credentials:');
    console.log('   👤 Buyer: buyer@foodee.com / password123');
    console.log('   🏪 Seller: seller@foodee.com / password123');
    console.log('   👤 Buyer 2: cuong@foodee.com / password123');
    console.log('   🏪 Seller 2: dung@foodee.com / password123\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

seedDirect().catch(console.error);
