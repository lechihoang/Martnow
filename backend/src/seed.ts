import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { User } from './account/user/entities/user.entity';
import { Buyer } from './account/buyer/entities/buyer.entity';
import { Seller } from './account/seller/entities/seller.entity';
import { Product } from './product/entities/product.entity';
import { Category } from './product/entities/category.entity';
import { Review } from './review/entities/review.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Favorite } from './favorite/entities/favorite.entity';
import { UserRole } from './lib/supabase';
import { SellerStats } from './seller-stats/entities/seller-stats.entity';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const CATEGORIES = [
  { name: 'Đồ uống', description: 'Nước ngọt, bia, rượu, nước suối, trà, cà phê' },
  { name: 'Bánh kẹo', description: 'Bánh quy, kẹo, chocolate, snack các loại' },
  { name: 'Gia vị', description: 'Nước mắm, tương ớt, dầu ăn, giấm, gia vị' },
  { name: 'Lương thực', description: 'Gạo, đậu, ngũ cốc, bột mì, thực phẩm khô' },
  { name: 'Thực phẩm chế biến', description: 'Mì tôm, cháo gói, thức ăn đóng hộp, đông lạnh' },
  { name: 'Đồ dùng vệ sinh', description: 'Bột giặt, nước rửa chén, giấy vệ sinh, xà phòng' },
  { name: 'Đồ gia dụng', description: 'Dụng cụ nhà bếp, đồ dùng sinh hoạt, thiết bị gia đình' },
];

const USERS = [
  // Buyers
  {
    name: 'Nguyễn Văn An',
    username: 'buyer_an',
    email: 'buyer@foodee.com',
    password: '123456',
    role: UserRole.BUYER,
    avatar: '/images/avatars/buyer-avatar.jpg',
    address: '123 Nguyễn Văn Cừ, Phường 3, Quận 5, TP.HCM',
    phone: '0912345678',
  },
  {
    name: 'Lê Văn Cường',
    username: 'buyer_cuong',
    email: 'cuong@foodee.com',
    password: '123456',
    role: UserRole.BUYER,
    avatar: '/images/avatars/cuong-avatar.jpg',
    address: '456 Trần Hưng Đạo, Phường Bến Nghé, Quận 1, TP.HCM',
    phone: '0987654321',
  },
  {
    name: 'Nguyễn Thị Mai',
    username: 'buyer_mai',
    email: 'mai@foodee.com',
    password: '123456',
    role: UserRole.BUYER,
    avatar: '/images/avatars/mai-avatar.jpg',
    address: '789 Lê Văn Việt, Phường Tăng Nhơn Phú A, TP.Thủ Đức',
    phone: '0918765432',
  },

  // Diverse Sellers
  {
    name: 'Trần Văn Minh',
    username: 'seller_minh',
    email: 'minh@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: '/images/avatars/minh-avatar.jpg',
    address: '45 Chợ Bến Thành, Quận 1, TP.HCM',
    phone: '0901111111',
    sellerInfo: {
      shopName: 'Tạp Hóa Minh Phát',
      shopAddress: '45 Chợ Bến Thành, Quận 1, TP.HCM',
      shopPhone: '0901111111',
      description: 'Tạp hóa truyền thống với đầy đủ các mặt hàng thiết yếu hàng ngày.',
    },
  },
  {
    name: 'Lê Thị Hương',
    username: 'seller_huong',
    email: 'huong@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: '/images/avatars/huong-avatar.jpg',
    address: '123 Chợ Tân Định, Quận 1, TP.HCM',
    phone: '0902222222',
    sellerInfo: {
      shopName: 'Thực Phẩm Sạch Hương',
      shopAddress: '123 Chợ Tân Định, Quận 1, TP.HCM',
      shopPhone: '0902222222',
      description: 'Chuyên cung cấp rau củ quả tươi, thịt cá sạch từ nông trại.',
    },
  },
  {
    name: 'Phạm Văn Đức',
    username: 'seller_duc',
    email: 'duc@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: '/images/avatars/duc-avatar.jpg',
    address: '789 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    phone: '0903333333',
    sellerInfo: {
      shopName: 'Siêu Thị Mini Đức Long',
      shopAddress: '789 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
      shopPhone: '0903333333',
      description: 'Siêu thị mini với đầy đủ mặt hàng tiêu dùng, giá cả hợp lý.',
    },
  },
  {
    name: 'Nguyễn Thị Lan',
    username: 'seller_lan',
    email: 'lan@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: '/images/avatars/lan-avatar.jpg',
    address: '234 Võ Văn Tần, Quận 3, TP.HCM',
    phone: '0904444444',
    sellerInfo: {
      shopName: 'Cửa Hàng Gia Dụng Lan Anh',
      shopAddress: '234 Võ Văn Tần, Quận 3, TP.HCM',
      shopPhone: '0904444444',
      description: 'Chuyên bán đồ gia dụng, vệ sinh nhà cửa với chất lượng tốt.',
    },
  },
  {
    name: 'Trần Thanh Tùng',
    username: 'seller_tung',
    email: 'tung@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: '/images/avatars/tung-avatar.jpg',
    address: '567 Pasteur, Quận 1, TP.HCM',
    phone: '0905555555',
    sellerInfo: {
      shopName: 'Thực Phẩm Nhập Khẩu Tùng',
      shopAddress: '567 Pasteur, Quận 1, TP.HCM',
      shopPhone: '0905555555',
      description: 'Chuyên thực phẩm nhập khẩu cao cấp, đồ uống ngoại.',
    },
  },
  {
    name: 'Võ Thị Kim',
    username: 'seller_kim',
    email: 'kim@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: '/images/avatars/kim-avatar.jpg',
    address: '890 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    phone: '0906666666',
    sellerInfo: {
      shopName: 'Trang Trại Sữa Kim',
      shopAddress: '890 Cách Mạng Tháng 8, Quận 10, TP.HCM',
      shopPhone: '0906666666',
      description: 'Chuyên các sản phẩm từ sữa tươi, trứng gà nuôi tự nhiên.',
    },
  },
];

const PRODUCTS = [
  // Lương thực - Trần Văn Minh
  {
    name: 'Gạo ST25 túi 5kg',
    description: 'Gạo ST25 thơm dẻo, được yêu thích nhất Việt Nam',
    price: 180000,
    categoryName: 'Lương thực',
    stock: 100,
    sellerUsername: 'seller_minh',
  },
  {
    name: 'Đậu đỏ loại 1 (500g)',
    description: 'Đậu đỏ hạt to, dùng nấu chè, làm bánh',
    price: 45000,
    categoryName: 'Lương thực',
    stock: 80,
    sellerUsername: 'seller_minh',
  },
  {
    name: 'Bột mì đa dụng (1kg)',
    description: 'Bột mì đa dụng số 8, làm bánh mì, bánh ngọt',
    price: 35000,
    categoryName: 'Lương thực',
    stock: 60,
    sellerUsername: 'seller_minh',
  },
  {
    name: 'Đường cát trắng (1kg)',
    description: 'Đường cát trắng tinh luyện cao cấp',
    price: 25000,
    categoryName: 'Lương thực',
    stock: 80,
    sellerUsername: 'seller_minh',
  },

  // Thực phẩm chế biến - Lê Thị Hương
  {
    name: 'Thịt bò đông lạnh (1kg)',
    description: 'Thịt bò đông lạnh nhập khẩu, thích hợp nướng BBQ',
    price: 280000,
    categoryName: 'Thực phẩm chế biến',
    stock: 20,
    sellerUsername: 'seller_huong',
  },
  {
    name: 'Cá hồi phi lê đông lạnh',
    description: 'Cá hồi phi lê đông lạnh Na Uy, giàu omega-3',
    price: 350000,
    categoryName: 'Thực phẩm chế biến',
    stock: 15,
    sellerUsername: 'seller_huong',
  },
  {
    name: 'Xúc xích Đức (500g)',
    description: 'Xúc xích Đức nguyên chất, không chất bảo quản',
    price: 120000,
    categoryName: 'Thực phẩm chế biến',
    stock: 40,
    sellerUsername: 'seller_huong',
  },
  {
    name: 'Pate gan heo (200g)',
    description: 'Pate gan heo thơm ngon, ăn kèm bánh mì',
    price: 45000,
    categoryName: 'Thực phẩm chế biến',
    stock: 50,
    sellerUsername: 'seller_huong',
  },

  // Đồ uống - Trần Thanh Tùng
  {
    name: 'Bia Heineken thùng 24 lon',
    description: 'Bia Heineken nhập khẩu chính hãng',
    price: 620000,
    categoryName: 'Đồ uống',
    stock: 25,
    sellerUsername: 'seller_tung',
  },
  {
    name: 'Nước ngọt Coca Cola (6 lon)',
    description: 'Nước ngọt Coca Cola 330ml, lốc 6 lon',
    price: 45000,
    categoryName: 'Đồ uống',
    stock: 100,
    sellerUsername: 'seller_tung',
  },
  {
    name: 'Nước suối Lavie (24 chai)',
    description: 'Nước suối Lavie 500ml, thùng 24 chai',
    price: 85000,
    categoryName: 'Đồ uống',
    stock: 80,
    sellerUsername: 'seller_tung',
  },
  {
    name: 'Rượu vang đỏ Chile',
    description: 'Rượu vang đỏ nhập khẩu từ Chile, độ cồn 13%',
    price: 320000,
    categoryName: 'Đồ uống',
    stock: 15,
    sellerUsername: 'seller_tung',
  },

  // Bánh kẹo - Phạm Văn Đức
  {
    name: 'Bánh quy Cosy hộp 378g',
    description: 'Bánh quy Cosy nhiều hương vị thơm ngon',
    price: 55000,
    categoryName: 'Bánh kẹo',
    stock: 60,
    sellerUsername: 'seller_duc',
  },
  {
    name: 'Kẹo dẻo Haribo (200g)',
    description: 'Kẹo dẻo Haribo nhập khẩu Đức nhiều hình thú',
    price: 85000,
    categoryName: 'Bánh kẹo',
    stock: 40,
    sellerUsername: 'seller_duc',
  },
  {
    name: 'Chocolate Kitkat (8 thanh)',
    description: 'Chocolate KitKat giòn tan, hộp 8 thanh',
    price: 95000,
    categoryName: 'Bánh kẹo',
    stock: 35,
    sellerUsername: 'seller_duc',
  },
  {
    name: 'Snack khoai tây Lay\'s (60g)',
    description: 'Snack khoai tây Lay\'s vị BBQ thơm ngon',
    price: 22000,
    categoryName: 'Bánh kẹo',
    stock: 80,
    sellerUsername: 'seller_duc',
  },

  // Gia vị - Trần Văn Minh
  {
    name: 'Nước mắm Phú Quốc (500ml)',
    description: 'Nước mắm Phú Quốc truyền thống độ đạm 35',
    price: 75000,
    categoryName: 'Gia vị',
    stock: 50,
    sellerUsername: 'seller_minh',
  },
  {
    name: 'Tương ớt Chinsu (500g)',
    description: 'Tương ớt Chinsu cay ngọt đậm đà',
    price: 32000,
    categoryName: 'Gia vị',
    stock: 70,
    sellerUsername: 'seller_minh',
  },
  {
    name: 'Dầu ăn Simply (1 lít)',
    description: 'Dầu ăn Simply từ đậu nành không cholesterol',
    price: 42000,
    categoryName: 'Gia vị',
    stock: 90,
    sellerUsername: 'seller_minh',
  },
  {
    name: 'Muối i-ốt Bình Minh (1kg)',
    description: 'Muối i-ốt tinh khiết, bổ sung khoáng chất',
    price: 15000,
    categoryName: 'Gia vị',
    stock: 100,
    sellerUsername: 'seller_minh',
  },

  // Thực phẩm chế biến - Phạm Văn Đức
  {
    name: 'Mì tôm Hảo Hảo (thùng 30 gói)',
    description: 'Mì tôm Hảo Hảo vị tôm chua cay thùng 30 gói',
    price: 135000,
    categoryName: 'Thực phẩm chế biến',
    stock: 45,
    sellerUsername: 'seller_duc',
  },
  {
    name: 'Cháo tươi SG Food (240g)',
    description: 'Cháo tươi SG Food vị thịt bằm, ăn liền tiện lợi',
    price: 18000,
    categoryName: 'Thực phẩm chế biến',
    stock: 60,
    sellerUsername: 'seller_duc',
  },
  {
    name: 'Cơm hộp Yoshinoya',
    description: 'Cơm hộp Yoshinoya bò teriyaki đông lạnh',
    price: 55000,
    categoryName: 'Thực phẩm chế biến',
    stock: 30,
    sellerUsername: 'seller_duc',
  },
  {
    name: 'Súp bột Knorr (5 gói)',
    description: 'Súp bột Knorr vị gà và nấm, hộp 5 gói',
    price: 45000,
    categoryName: 'Thực phẩm chế biến',
    stock: 40,
    sellerUsername: 'seller_duc',
  },

  // Lương thực - Võ Thị Kim
  {
    name: 'Sữa tươi Vinamilk (1 lít)',
    description: 'Sữa tươi Vinamilk 100% không đường',
    price: 32000,
    categoryName: 'Lương thực',
    stock: 80,
    sellerUsername: 'seller_kim',
  },
  {
    name: 'Trứng gà ta (10 quả)',
    description: 'Trứng gà ta nuôi thả vườn, tự nhiên 100%',
    price: 45000,
    categoryName: 'Lương thực',
    stock: 100,
    sellerUsername: 'seller_kim',
  },
  {
    name: 'Yaourt Vinamilk (hộp 4 cốc)',
    description: 'Yaourt Vinamilk có đường vị dâu',
    price: 28000,
    categoryName: 'Lương thực',
    stock: 60,
    sellerUsername: 'seller_kim',
  },
  {
    name: 'Sữa đặc có đường (380g)',
    description: 'Sữa đặc Ông Thọ có đường thơm ngon',
    price: 25000,
    categoryName: 'Lương thực',
    stock: 50,
    sellerUsername: 'seller_kim',
  },

  // Đồ dùng vệ sinh - Nguyễn Thị Lan
  {
    name: 'Bột giặt Omo (6kg)',
    description: 'Bột giặt Omo khử mùi và diệt khuẩn',
    price: 185000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 30,
    sellerUsername: 'seller_lan',
  },
  {
    name: 'Nước rửa chén Sunlight (800ml)',
    description: 'Nước rửa chén Sunlight chanh sạch khuẩn',
    price: 35000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 70,
    sellerUsername: 'seller_lan',
  },
  {
    name: 'Giấy vệ sinh Paseo (12 cuộn)',
    description: 'Giấy vệ sinh Paseo 3 lớp siêu thấm',
    price: 85000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 50,
    sellerUsername: 'seller_lan',
  },
  {
    name: 'Xà phòng Lifebuoy (90g x 4)',
    description: 'Xà phòng diệt khuẩn Lifebuoy bảo vệ da',
    price: 28000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 60,
    sellerUsername: 'seller_lan',
  },

  // Đồ gia dụng - Nguyễn Thị Lan
  {
    name: 'Chảo chống dính 28cm',
    description: 'Chảo chống dính cao cấp, đáy từ 3 lớp',
    price: 250000,
    categoryName: 'Đồ gia dụng',
    stock: 25,
    sellerUsername: 'seller_lan',
  },
  {
    name: 'Bình đựng nước 2.5L',
    description: 'Bình đựng nước nhựa trong, có vòi rót',
    price: 85000,
    categoryName: 'Đồ gia dụng',
    stock: 40,
    sellerUsername: 'seller_lan',
  },
  {
    name: 'Hộp đựng thực phẩm (5 chiếc)',
    description: 'Hộp đựng thực phẩm nhựa PP, kín khí',
    price: 125000,
    categoryName: 'Đồ gia dụng',
    stock: 30,
    sellerUsername: 'seller_lan',
  },
  {
    name: 'Dao thái đa năng',
    description: 'Dao thái inox 420 siêu sắc, cán gỗ',
    price: 65000,
    categoryName: 'Đồ gia dụng',
    stock: 35,
    sellerUsername: 'seller_lan',
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Debug environment variables
  console.log('🔍 Environment check:');
  console.log(
    'SUPABASE_URL:',
    process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set',
  );
  console.log(
    'SUPABASE_SERVICE_ROLE_KEY:',
    process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set',
  );
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL ? '✅ Set' : '❌ Not set',
  );

  // Initialize Supabase client
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  console.log('🔐 Supabase client initialized');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      User,
      Buyer,
      Seller,
      Category,
      Product,
      Review,
      Order,
      OrderItem,
      Favorite,
      SellerStats,
    ],
    synchronize: false, // Không auto-sync để bảo vệ dữ liệu
    logging: true,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Connected to database');

    // Get repositories
    const userRepo = dataSource.getRepository(User);
    const buyerRepo = dataSource.getRepository(Buyer);
    const sellerRepo = dataSource.getRepository(Seller);
    const categoryRepo = dataSource.getRepository(Category);
    const productRepo = dataSource.getRepository(Product);
    const sellerStatsRepo = dataSource.getRepository(SellerStats);

    // Seed categories
    console.log('📂 Seeding categories...');
    const savedCategories = await categoryRepo.save(
      CATEGORIES.map((cat) => categoryRepo.create(cat)),
    );
    console.log(`✅ Created ${savedCategories.length} categories`);

    // Seed users with Supabase Auth
    console.log('👥 Seeding users with Supabase Auth...');
    const savedUsers: User[] = [];

    for (const userData of USERS) {
      const { sellerInfo, password, ...userFields } = userData;

      try {
        // 1. Tạo user trong Supabase Auth trước
        console.log(`   🔐 Creating Supabase Auth user: ${userData.email}`);
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: userData.email,
            password: password,
            email_confirm: true, // Auto confirm email
            user_metadata: {
              name: userData.name,
              username: userData.username,
              role: userData.role,
            },
          });

        if (authError) {
          console.warn(
            `   ⚠️ Auth user already exists or error: ${authError.message}`,
          );
          // Bỏ qua user đã tồn tại
          continue;
        }

        if (!authData.user) {
          console.error(`   ❌ No user data returned for: ${userData.email}`);
          continue;
        }

        console.log(`   ✅ Supabase Auth user created: ${authData.user.id}`);

        // 2. Tạo user profile trong database với Supabase Auth ID
        console.log(`   💾 Creating database profile for: ${userData.email}`);
        const user = userRepo.create({
          id: authData.user.id, // Dùng Supabase Auth ID
          ...userFields,
        });

        const savedUser = await userRepo.save(user);
        savedUsers.push(savedUser);

        console.log(
          `   ✅ Created user profile: ${savedUser.username} (${savedUser.role})`,
        );

        // 3. Tạo buyer hoặc seller profile
        if (savedUser.role === UserRole.BUYER) {
          const buyer = buyerRepo.create({ id: savedUser.id });
          await buyerRepo.save(buyer);
          console.log(`   ✅ Created buyer profile for ${savedUser.username}`);
        } else if (savedUser.role === UserRole.SELLER && sellerInfo) {
          const seller = sellerRepo.create({
            id: savedUser.id,
            shopName: sellerInfo.shopName,
            shopAddress: sellerInfo.shopAddress,
            shopPhone: sellerInfo.shopPhone,
            description: sellerInfo.description,
          });
          await sellerRepo.save(seller);
          console.log(`   ✅ Created seller profile for ${savedUser.username}`);
        }
      } catch (error) {
        console.error(`   ❌ Error creating user ${userData.email}:`, error);
      }
    }

    // Seed products
    console.log('🛍️ Seeding products...');
    for (const productData of PRODUCTS) {
      const category = savedCategories.find(
        (cat) => cat.name === productData.categoryName,
      );
      const seller = savedUsers.find(
        (user) => user.username === productData.sellerUsername,
      );

      if (!category || !seller) {
        console.warn(
          `⚠️ Skipping product ${productData.name} - category or seller not found`,
        );
        continue;
      }

      const product = productRepo.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        categoryId: category.id,
        sellerId: seller.id,
      });

      await productRepo.save(product);
      console.log(`   ✅ Created product: ${productData.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('=== BUYERS ===');
    console.log('Buyer 1: buyer@foodee.com / 123456 (Nguyễn Văn An)');
    console.log('Buyer 2: cuong@foodee.com / 123456 (Lê Văn Cường)');
    console.log('Buyer 3: mai@foodee.com / 123456 (Nguyễn Thị Mai)');
    console.log('\n=== SELLERS ===');
    console.log('Tạp Hóa: minh@foodee.com / 123456 (Tạp Hóa Minh Phát)');
    console.log('Thực Phẩm Sạch: huong@foodee.com / 123456 (Thực Phẩm Sạch Hương)');
    console.log('Siêu Thị Mini: duc@foodee.com / 123456 (Siêu Thị Mini Đức Long)');
    console.log('Đồ Gia Dụng: lan@foodee.com / 123456 (Cửa Hàng Gia Dụng Lan Anh)');
    console.log('Nhập Khẩu: tung@foodee.com / 123456 (Thực Phẩm Nhập Khẩu Tùng)');
    console.log('Sữa & Trứng: kim@foodee.com / 123456 (Trang Trại Sữa Kim)');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seed };
