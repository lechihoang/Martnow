import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

// Import entities
import { User } from './account/user/entities/user.entity';
import { Buyer } from './account/buyer/entities/buyer.entity';
import { Seller } from './account/seller/entities/seller.entity';
import { SellerStats } from './seller-stats/entities/seller-stats.entity';
import { Product } from './product/entities/product.entity';
import { Category } from './product/entities/category.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Review } from './review/entities/review.entity';
import { Favorite } from './favorite/entities/favorite.entity';
import { UserRole } from './auth/roles.enum';

// 🗂️ MASTER DATA
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
      description: 'Quán ăn gia đình với các món ăn truyền thống Việt Nam. Được thành lập từ năm 2020, chúng tôi luôn cam kết mang đến những món ăn chất lượng, tươi ngon với giá cả hợp lý.'
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
  // Bánh mì (categoryId: 1)
  { name: 'Bánh mì thịt nướng', description: 'Bánh mì thịt nướng thơm ngon, ăn kèm rau sống', price: 25000, categoryName: 'Bánh mì', stock: 50, sellerUsername: 'seller_binh' },
  { name: 'Bánh mì pate', description: 'Bánh mì pate truyền thống với chả lụa', price: 20000, categoryName: 'Bánh mì', stock: 40, sellerUsername: 'seller_binh' },
  { name: 'Bánh mì chả cá', description: 'Bánh mì chả cá Nha Trang đặc biệt', price: 30000, categoryName: 'Bánh mì', stock: 35, sellerUsername: 'seller_binh' },
  { name: 'Bánh mì xíu mại', description: 'Bánh mì xíu mại sốt cà chua', price: 28000, categoryName: 'Bánh mì', stock: 45, sellerUsername: 'seller_binh' },
  
  // Đồ uống (categoryId: 2)
  { name: 'Trà sữa trân châu', description: 'Trà sữa trân châu đường đen thơm ngon', price: 35000, categoryName: 'Đồ uống', stock: 60, sellerUsername: 'seller_binh' },
  { name: 'Cà phê đen đá', description: 'Cà phê phin truyền thống', price: 15000, categoryName: 'Đồ uống', stock: 80, sellerUsername: 'seller_binh' },
  { name: 'Nước chanh dây', description: 'Nước chanh dây tươi mát', price: 18000, categoryName: 'Đồ uống', stock: 50, sellerUsername: 'seller_binh' },
  { name: 'Sinh tố bơ', description: 'Sinh tố bơ béo ngậy', price: 25000, categoryName: 'Đồ uống', stock: 30, sellerUsername: 'seller_binh' },
  
  // Bánh ngọt (categoryId: 3) - Seller Dung
  { name: 'Bánh flan', description: 'Bánh flan caramel mềm mịn', price: 12000, categoryName: 'Bánh ngọt', stock: 25, sellerUsername: 'seller_dung' },
  { name: 'Bánh tiramisu', description: 'Bánh tiramisu Ý chính hiệu', price: 45000, categoryName: 'Bánh ngọt', stock: 20, sellerUsername: 'seller_dung' },
  { name: 'Bánh red velvet', description: 'Bánh red velvet với cream cheese', price: 38000, categoryName: 'Bánh ngọt', stock: 15, sellerUsername: 'seller_dung' },
  { name: 'Bánh chocolate lava', description: 'Bánh chocolate lava nóng hổi', price: 32000, categoryName: 'Bánh ngọt', stock: 18, sellerUsername: 'seller_dung' },
  
  // Món chính (categoryId: 4)
  { name: 'Cơm tấm sườn nướng', description: 'Cơm tấm sườn nướng đặc biệt', price: 55000, categoryName: 'Món chính', stock: 40, sellerUsername: 'seller_binh' },
  { name: 'Phở bò tái', description: 'Phở bò tái truyền thống Hà Nội', price: 50000, categoryName: 'Món chính', stock: 35, sellerUsername: 'seller_binh' },
  { name: 'Bún bò Huế', description: 'Bún bò Huế cay nồng đậm đà', price: 48000, categoryName: 'Món chính', stock: 30, sellerUsername: 'seller_binh' },
  { name: 'Cơm gà Hải Nam', description: 'Cơm gà Hải Nam thơm ngon', price: 52000, categoryName: 'Món chính', stock: 25, sellerUsername: 'seller_binh' },
  
  // Snack (categoryId: 5)
  { name: 'Bánh tráng nướng', description: 'Bánh tráng nướng Đà Lạt', price: 8000, categoryName: 'Snack', stock: 100, sellerUsername: 'seller_binh' },
  { name: 'Chè thái', description: 'Chè thái nhiều màu sắc', price: 22000, categoryName: 'Snack', stock: 40, sellerUsername: 'seller_binh' },
  { name: 'Bánh xèo mini', description: 'Bánh xèo mini giòn rụm', price: 15000, categoryName: 'Snack', stock: 60, sellerUsername: 'seller_binh' },
  { name: 'Nem nướng Nha Trang', description: 'Nem nướng Nha Trang chấm tương', price: 35000, categoryName: 'Snack', stock: 45, sellerUsername: 'seller_binh' }
];


const SAMPLE_REVIEWS = [
  {
    buyerUsername: 'buyer_an',
    productName: 'Bánh mì thịt nướng',
    rating: 5,
    comment: 'Bánh mì rất ngon, thịt nướng thơm lừng và rau củ tươi mát. Sẽ quay lại ủng hộ!'
  },
  {
    buyerUsername: 'buyer_cuong',
    productName: 'Bánh tiramisu',
    rating: 4,
    comment: 'Bánh tiramisu ngon, vị đậm đà. Chỉ hơi ngọt một tí so với sở thích cá nhân.'
  },
  {
    buyerUsername: 'buyer_an',
    productName: 'Cà phê đen đá',
    rating: 5,
    comment: 'Cà phê đậm đà, đúng kiểu truyền thống. Giá cả hợp lý!'
  }
];

class DatabaseReset {
  private app: any;
  private dataSource: DataSource;
  private repositories: { [key: string]: Repository<any> } = {};

  async initialize() {
    console.log('🚀 Initializing NestJS application context...\n');
    this.app = await NestFactory.createApplicationContext(AppModule);
    this.dataSource = this.app.get(DataSource);
    
    // Get all repositories
    this.repositories = {
      user: this.app.get(getRepositoryToken(User)) as Repository<User>,
      buyer: this.app.get(getRepositoryToken(Buyer)) as Repository<Buyer>,
      seller: this.app.get(getRepositoryToken(Seller)) as Repository<Seller>,
      sellerStats: this.app.get(getRepositoryToken(SellerStats)) as Repository<SellerStats>,
      category: this.app.get(getRepositoryToken(Category)) as Repository<Category>,
      product: this.app.get(getRepositoryToken(Product)) as Repository<Product>,
      review: this.app.get(getRepositoryToken(Review)) as Repository<Review>,
      order: this.app.get(getRepositoryToken(Order)) as Repository<Order>,
      orderItem: this.app.get(getRepositoryToken(OrderItem)) as Repository<OrderItem>,
      favorite: this.app.get(getRepositoryToken(Favorite)) as Repository<Favorite>,
    };
  }

  async resetDatabase() {
    console.log('🗑️ RESETTING DATABASE...\n');

    try {
      console.log('🧹 Truncating all tables...');
      const tableNames = [
        'favorite', 'review', 'order_item', 'order',
        'product', 'seller_stats', 'seller', 'buyer',
        'user', 'category'
      ];

      // PostgreSQL: Disable triggers and use CASCADE
      for (const tableName of tableNames) {
        await this.dataSource.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
        console.log(`   ✅ Truncated: ${tableName}`);
      }
      
      console.log('✅ Database reset completed!\n');
    } catch (error) {
      console.error('❌ Error during database reset:', error);
      throw error;
    }
  }

  async seedCategories() {
    console.log('📂 SEEDING CATEGORIES...');
    
    for (const categoryData of CATEGORIES) {
      const category = this.repositories.category.create(categoryData);
      await this.repositories.category.save(category);
      console.log(`   ✅ Created: ${categoryData.name}`);
    }
    console.log('');
  }

  async seedUsers() {
    console.log('👥 SEEDING USERS...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const userData of USERS) {
      // Create user
      const user = this.repositories.user.create({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        avatar: userData.avatar,
        address: userData.address,
        phone: userData.phone,
      });
      const savedUser = await this.repositories.user.save(user);
      console.log(`   ✅ Created user: ${userData.username} (${userData.role})`);

      // Create buyer/seller profile
      if (userData.role === UserRole.BUYER) {
        const buyer = this.repositories.buyer.create({ id: savedUser.id });
        await this.repositories.buyer.save(buyer);
        console.log(`      ↳ Created buyer profile`);

      } else if (userData.role === UserRole.SELLER) {
        const seller = this.repositories.seller.create({
          id: savedUser.id,
          shopName: userData.sellerInfo?.shopName,
          shopAddress: userData.sellerInfo?.shopAddress,
          shopPhone: userData.sellerInfo?.shopPhone,
          description: userData.sellerInfo?.description,
        });
        const savedSeller = await this.repositories.seller.save(seller);
        console.log(`      ↳ Created seller profile: ${userData.sellerInfo?.shopName}`);

        // Create seller stats
        const sellerStats = this.repositories.sellerStats.create({
          id: savedSeller.id, // SellerStats sử dụng same id
          totalOrders: Math.floor(Math.random() * 50) + 10,
          totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
          totalProducts: 0, // Will be updated after products
          pendingOrders: Math.floor(Math.random() * 5),
          completedOrders: Math.floor(Math.random() * 45) + 5,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
          totalReviews: Math.floor(Math.random() * 50) + 10
        });
        await this.repositories.sellerStats.save(sellerStats);
        console.log(`      ↳ Created seller stats`);
      }
    }
    console.log('');
  }

  async seedProducts() {
    console.log('🍽️ SEEDING PRODUCTS...');

    for (const productData of PRODUCTS) {
      // Find category
      const category = await this.repositories.category.findOne({
        where: { name: productData.categoryName }
      });
      if (!category) {
        console.log(`   ❌ Category not found: ${productData.categoryName}`);
        continue;
      }

      // Find seller
      const sellerUser = await this.repositories.user.findOne({
        where: { username: productData.sellerUsername }
      });
      if (!sellerUser) {
        console.log(`   ❌ Seller not found: ${productData.sellerUsername}`);
        continue;
      }

      const seller = await this.repositories.seller.findOne({
        where: { id: sellerUser.id }
      });
      if (!seller) {
        console.log(`   ❌ Seller profile not found for: ${productData.sellerUsername}`);
        continue;
      }

      // Create product
      const product = this.repositories.product.create({
        sellerId: seller.id,
        categoryId: category.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        isAvailable: true,
        stock: productData.stock,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0,
        slug: this.generateSlug(productData.name),
        averageRating: 0,
        totalReviews: 0,
        totalSold: Math.floor(Math.random() * 100),
        viewCount: Math.floor(Math.random() * 500),
      });

      await this.repositories.product.save(product);
      console.log(`   ✅ Created: ${productData.name} (${productData.categoryName})`);
    }
    console.log('');
  }


  async seedReviews() {
    console.log('⭐ SEEDING REVIEWS...');

    for (const reviewData of SAMPLE_REVIEWS) {
      // Find buyer
      const buyerUser = await this.repositories.user.findOne({
        where: { username: reviewData.buyerUsername }
      });
      if (!buyerUser) continue;

      const buyer = await this.repositories.buyer.findOne({
        where: { id: buyerUser.id }
      });
      if (!buyer) continue;

      // Find product
      const product = await this.repositories.product.findOne({
        where: { name: reviewData.productName }
      });
      if (!product) continue;

      // Check if review already exists
      const existingReview = await this.repositories.review.findOne({
        where: { buyerId: buyer.id, productId: product.id }
      });
      if (existingReview) continue;

      const review = this.repositories.review.create({
        buyerId: buyer.id,
        productId: product.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        helpfulCount: Math.floor(Math.random() * 10),
      });

      await this.repositories.review.save(review);
      console.log(`   ✅ Created review: ${reviewData.buyerUsername} → ${reviewData.productName} (${reviewData.rating}⭐)`);

      // Update product statistics
      await this.updateProductStatistics(product.id);
    }
    console.log('');
  }

  async updateStatistics() {
    console.log('📊 UPDATING STATISTICS...');

    // Update seller stats with actual product counts
    const sellers = await this.repositories.seller.find();
    for (const seller of sellers) {
      const productCount = await this.repositories.product.count({
        where: { sellerId: seller.id }
      });

      await this.repositories.sellerStats.update(
        { id: seller.id },
        { totalProducts: productCount }
      );
      console.log(`   ✅ Updated seller stats for seller ID: ${seller.id}`);
    }
    console.log('');
  }

  private async updateProductStatistics(productId: number) {
    const reviews = await this.repositories.review.find({
      where: { productId }
    });

    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = Number((totalRating / totalReviews).toFixed(2));
    }

    await this.repositories.product.update(productId, {
      averageRating,
      totalReviews
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  async printSummary() {
    console.log('📊 DATABASE SUMMARY:');
    console.log(`   • Categories: ${await this.repositories.category.count()}`);
    console.log(`   • Users: ${await this.repositories.user.count()}`);
    console.log(`   • Buyers: ${await this.repositories.buyer.count()}`);
    console.log(`   • Sellers: ${await this.repositories.seller.count()}`);
    console.log(`   • Products: ${await this.repositories.product.count()}`);
    console.log(`   • Reviews: ${await this.repositories.review.count()}`);
    console.log('');
  }

  async close() {
    await this.app.close();
  }
}

// 🚀 MAIN EXECUTION
async function resetAndSeedDatabase() {
  const dbReset = new DatabaseReset();

  try {
    console.log('🎯 FOODEE DATABASE RESET & SEED\n');
    console.log('⚠️  WARNING: This will completely reset your database!\n');

    await dbReset.initialize();
    await dbReset.resetDatabase();
    
    await dbReset.seedCategories();
    await dbReset.seedUsers();
    await dbReset.seedProducts();
    await dbReset.seedReviews();
    await dbReset.updateStatistics();
    
    await dbReset.printSummary();
    
    console.log('🎉 DATABASE RESET & SEED COMPLETED SUCCESSFULLY!');
    console.log('🔑 Default login credentials:');
    console.log('   👤 Buyer: buyer@foodee.com / password123');
    console.log('   🏪 Seller: seller@foodee.com / password123');
    console.log('   👤 Buyer 2: cuong@foodee.com / password123');
    console.log('   🏪 Seller 2: dung@foodee.com / password123\n');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    await dbReset.close();
  }
}

resetAndSeedDatabase();
