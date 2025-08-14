import { DataSource } from 'typeorm';
import { Category } from './product/entities/category.entity';
import { Product } from './product/entities/product.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(dataSource: DataSource) {
  console.log('🌱 Starting database seed...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    
    // 1. Seed Users first (no dependencies)
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        id: 1,
        username: 'buyer1',
        email: 'buyer1@example.com',
        password: hashedPassword,
        name: 'Nguyễn Văn A',
        role: 'buyer'
      },
      {
        id: 2,
        username: 'seller1',
        email: 'seller1@example.com',
        password: hashedPassword,
        name: 'Trần Thị B',
        role: 'seller'
      },
      {
        id: 3,
        username: 'seller2',
        email: 'seller2@example.com',
        password: hashedPassword,
        name: 'Lê Văn C',
        role: 'seller'
      },
      {
        id: 4,
        username: 'buyer2',
        email: 'buyer2@example.com',
        password: hashedPassword,
        name: 'Phạm Thị D',
        role: 'buyer'
      }
    ];

    for (const userData of users) {
      await queryRunner.query(
        'INSERT INTO "user" (id, username, email, password, name, role) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [userData.id, userData.username, userData.email, userData.password, userData.name, userData.role]
      );
    }
    console.log('✅ Users seeded successfully!');

    // 2. Seed Categories  
    console.log('📁 Seeding categories...');
    const categories = [
      {
        name: 'Đồ ăn nhanh',
        description: 'Burger, pizza, sandwich, v.v.'
      },
      {
        name: 'Đồ uống',
        description: 'Nước ngọt, trà sữa, cà phê, v.v.'
      },
      {
        name: 'Món Việt',
        description: 'Phở, bún bò, cơm tấm, v.v.'
      },
      {
        name: 'Tráng miệng',
        description: 'Kem, chè, bánh ngọt, v.v.'
      },
      {
        name: 'Món chay',
        description: 'Các món ăn chay, healthy food'
      }
    ];

    for (const categoryData of categories) {
      await queryRunner.query(
        'INSERT INTO category (name, description) VALUES ($1, $2)',
        [categoryData.name, categoryData.description]
      );
    }
    console.log('✅ Categories seeded successfully!');

    // 3. Seed Buyers (depends on Users)
    console.log('🛌 Seeding buyers...');
    const buyers = [
      { id: 1 }, // buyer1
      { id: 4 }  // buyer2  
    ];

    for (const buyerData of buyers) {
      await queryRunner.query(
        'INSERT INTO buyer (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
        [buyerData.id]
      );
    }
    console.log('✅ Buyers seeded successfully!');

    // 4. Seed Sellers (depends on Users)
    console.log('🏦 Seeding sellers...');
    const sellers = [
      {
        id: 2, // seller1
        shopName: 'Quán Cơm Tấm Sài Gòn',
        shopAddress: 'Số 123 Nguyễn Trãi, Quận 5, TP.HCM',
        shopPhone: '0902234567',
        description: 'Chuyên cơm tấm và món Việt truyền thống'
      },
      {
        id: 3, // seller2  
        shopName: 'Trà Sữa House',
        shopAddress: 'Số 456 Lê Lai, Quận 1, TP.HCM',
        shopPhone: '0902234568',
        description: 'Trà sữa và đồ uống giải khát'
      }
    ];

    for (const sellerData of sellers) {
      await queryRunner.query(
        'INSERT INTO seller (id, "shopName", "shopAddress", "shopPhone", description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [sellerData.id, sellerData.shopName, sellerData.shopAddress, sellerData.shopPhone, sellerData.description]
      );
    }
    console.log('✅ Sellers seeded successfully!');

    // 5. Seed Products (depends on Sellers and Categories)
    console.log('🍔 Seeding products...');
    const products = [
      {
        sellerId: 2,
        categoryId: 3, // Món Việt
        name: 'Cơm Tấm Sườn Nướng',
        description: 'Cơm tấm thơm ngon với sườn nướng BBQ, chả trứng, bì',
        price: 45000,
        stock: 20,
        discount: 0,
        isAvailable: true
      },
      {
        sellerId: 2,
        categoryId: 3, // Món Việt
        name: 'Bún Bò Huế',
        description: 'Bún bò Huế cay nồng, đậm đà hương vị miền Trung',
        price: 35000,
        stock: 15,
        discount: 10,
        isAvailable: true
      },
      {
        sellerId: 3,
        categoryId: 2, // Đồ uống
        name: 'Trà Sữa Trân Châu Đường Đen',
        description: 'Trà sữa trân châu đường đen thơm ngon, ngọt mát',
        price: 25000,
        stock: 50,
        discount: 5,
        isAvailable: true
      },
      {
        sellerId: 3,
        categoryId: 2, // Đồ uống
        name: 'Cà Phê Sữa Đá',
        description: 'Cà phê phin truyền thống với sữa đặc ngọt ngào',
        price: 18000,
        stock: 30,
        discount: 0,
        isAvailable: true
      },
      {
        sellerId: 2,
        categoryId: 1, // Đồ ăn nhanh
        name: 'Bánh Mì Thịt Nướng',
        description: 'Bánh mì giòn tan với thịt nướng thơm lừng',
        price: 20000,
        stock: 25,
        discount: 0,
        isAvailable: true
      },
      {
        sellerId: 3,
        categoryId: 4, // Tráng miệng
        name: 'Chè Thái Lan',
        description: 'Chè thái lan đầy đủ topping, mát lạnh giải nhiệt',
        price: 22000,
        stock: 20,
        discount: 15,
        isAvailable: true
      }
    ];

    for (const productData of products) {
      await queryRunner.query(
        'INSERT INTO product ("sellerId", "categoryId", name, description, price, stock, discount, "isAvailable") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [productData.sellerId, productData.categoryId, productData.name, productData.description, productData.price, productData.stock, productData.discount, productData.isAvailable]
      );
    }
    console.log('✅ Products seeded successfully!');

    // Note: Skipping orders and order items for initial setup
    // Sellers start with 0 revenue and orders

    // Note: Skipping reviews and favorites for initial setup
    // Users will create these through the app

    // 10. Seed Seller Stats (Initial stats - no revenue yet)
    console.log('📈 Seeding seller stats (initial)...');
    const sellerStats = [
      {
        id: 2, // seller1
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 3, // Only count of products they have
        pendingOrders: 0,
        completedOrders: 0,
        averageRating: 0,
        totalReviews: 0
      },
      {
        id: 3, // seller2
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 3, // Only count of products they have
        pendingOrders: 0,
        completedOrders: 0,
        averageRating: 0,
        totalReviews: 0
      }
    ];

    for (const statsData of sellerStats) {
      await queryRunner.query(
        'INSERT INTO seller_stats (id, "totalOrders", "totalRevenue", "totalProducts", "pendingOrders", "completedOrders", "averageRating", "totalReviews") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
        [statsData.id, statsData.totalOrders, statsData.totalRevenue, statsData.totalProducts, statsData.pendingOrders, statsData.completedOrders, statsData.averageRating, statsData.totalReviews]
      );
    }
    console.log('✅ Initial seller stats seeded successfully!');
    console.log('ℹ️  Sellers start with 0 orders, 0 revenue - stats will update as users interact with the app');

    await queryRunner.commitTransaction();
    console.log('✅ Database seed completed successfully!');

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// Script chạy seed nếu được gọi trực tiếp
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  import('typeorm').then(async ({ DataSource }) => {
    const AppDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'foodee_db',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Let TypeORM handle schema creation
      logging: true, // Enable logging để debug
    });

    try {
      await AppDataSource.initialize();
      console.log('📊 Database connection initialized');
      
      await seedDatabase(AppDataSource);
      
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    }
  });
}
