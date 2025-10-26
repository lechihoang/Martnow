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
  {
    name: 'Đồ uống',
    description: 'Nước ngọt, bia, rượu, nước suối, trà, cà phê',
  },
  { name: 'Bánh kẹo', description: 'Bánh quy, kẹo, chocolate, snack các loại' },
  { name: 'Gia vị', description: 'Nước mắm, tương ớt, dầu ăn, giấm, gia vị' },
  {
    name: 'Lương thực',
    description: 'Gạo, đậu, ngũ cốc, bột mì, thực phẩm khô',
  },
  {
    name: 'Thực phẩm chế biến',
    description: 'Mì tôm, cháo gói, thức ăn đóng hộp, đông lạnh',
  },
  {
    name: 'Đồ dùng vệ sinh',
    description: 'Bột giặt, nước rửa chén, giấy vệ sinh, xà phòng',
  },
  {
    name: 'Đồ gia dụng',
    description: 'Dụng cụ nhà bếp, đồ dùng sinh hoạt, thiết bị gia đình',
  },
];

const USERS = [
  // Buyers
  {
    name: 'Nguyễn Văn An',
    username: 'buyer_an',
    email: 'buyer@foodee.com',
    password: '123456',
    role: UserRole.BUYER,
    avatar: null, // Will show User icon in frontend
    address: '123 Nguyễn Văn Cừ, Phường 3, Quận 5, TP.HCM',
    phone: '0912345678',
  },
  {
    name: 'Lê Văn Cường',
    username: 'buyer_cuong',
    email: 'cuong@foodee.com',
    password: '123456',
    role: UserRole.BUYER,
    avatar: null, // Will show User icon in frontend
    address: '456 Trần Hưng Đạo, Phường Bến Nghé, Quận 1, TP.HCM',
    phone: '0987654321',
  },
  {
    name: 'Nguyễn Thị Mai',
    username: 'buyer_mai',
    email: 'mai@foodee.com',
    password: '123456',
    role: UserRole.BUYER,
    avatar: null, // Will show User icon in frontend
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
    avatar: null, // Will show User icon in frontend
    address: '45 Chợ Bến Thành, Quận 1, TP.HCM',
    phone: '0901111111',
    sellerInfo: {
      shopName: 'Tạp Hóa Minh Phát',
      shopAddress: '45 Chợ Bến Thành, Quận 1, TP.HCM',
      shopPhone: '0901111111',
      description:
        'Tạp hóa truyền thống với đầy đủ các mặt hàng thiết yếu hàng ngày.',
    },
  },
  {
    name: 'Lê Thị Hương',
    username: 'seller_huong',
    email: 'huong@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: null, // Will show User icon in frontend
    address: '123 Chợ Tân Định, Quận 1, TP.HCM',
    phone: '0902222222',
    sellerInfo: {
      shopName: 'Thực Phẩm Sạch Hương',
      shopAddress: '123 Chợ Tân Định, Quận 1, TP.HCM',
      shopPhone: '0902222222',
      description:
        'Chuyên cung cấp rau củ quả tươi, thịt cá sạch từ nông trại.',
    },
  },
  {
    name: 'Phạm Văn Đức',
    username: 'seller_duc',
    email: 'duc@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: null, // Will show User icon in frontend
    address: '789 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    phone: '0903333333',
    sellerInfo: {
      shopName: 'Siêu Thị Mini Đức Long',
      shopAddress: '789 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
      shopPhone: '0903333333',
      description:
        'Siêu thị mini với đầy đủ mặt hàng tiêu dùng, giá cả hợp lý.',
    },
  },
  {
    name: 'Nguyễn Thị Lan',
    username: 'seller_lan',
    email: 'lan@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: null, // Will show User icon in frontend
    address: '234 Võ Văn Tần, Quận 3, TP.HCM',
    phone: '0904444444',
    sellerInfo: {
      shopName: 'Cửa Hàng Gia Dụng Lan Anh',
      shopAddress: '234 Võ Văn Tần, Quận 3, TP.HCM',
      shopPhone: '0904444444',
      description:
        'Chuyên bán đồ gia dụng, vệ sinh nhà cửa với chất lượng tốt.',
    },
  },
  {
    name: 'Trần Thanh Tùng',
    username: 'seller_tung',
    email: 'tung@foodee.com',
    password: '123456',
    role: UserRole.SELLER,
    avatar: null, // Will show User icon in frontend
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
    avatar: null, // Will show User icon in frontend
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
  // Gia vị - Trần Văn Minh
  {
    name: 'Dầu đậu nành Simply (1 lít)',
    description: 'Dầu đậu nành Simply 100% tinh khiết, không cholesterol, tốt cho sức khỏe tim mạch',
    price: 42000,
    categoryName: 'Gia vị',
    stock: 90,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product1.jpg',
  },
  {
    name: 'Đường tinh luyện Biên Hòa Pure (1kg)',
    description: 'Đường tinh luyện Biên Hòa Pure tinh khiết tự nhiên, hạt mịn tan nhanh',
    price: 28000,
    categoryName: 'Lương thực',
    stock: 80,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product2.png',
  },
  {
    name: 'Chảo chống dính 28cm',
    description: 'Chảo chống dính cao cấp size 28cm, đáy từ 3 lớp, phù hợp mọi loại bếp',
    price: 250000,
    categoryName: 'Đồ gia dụng',
    stock: 25,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product3.jpeg',
  },
  {
    name: 'Đậu đỏ loại 1 (500g)',
    description: 'Đậu đỏ hạt to đều, màu đỏ tươi, dùng nấu chè, làm bánh, giàu dinh dưỡng',
    price: 45000,
    categoryName: 'Lương thực',
    stock: 80,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product4.jpg',
  },
  {
    name: 'Nước mắm Phú Quốc (500ml)',
    description: 'Nước mắm Phú Quốc truyền thống độ đạm 40 độ đạm, hương vị đậm đà',
    price: 75000,
    categoryName: 'Gia vị',
    stock: 50,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product5.jpg',
  },
  {
    name: 'Bột mì đa dụng Meizan (1kg)',
    description: 'Bột mì đa dụng cao cấp Meizan, làm bánh mì, bánh ngọt, bánh pizza',
    price: 35000,
    categoryName: 'Lương thực',
    stock: 60,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product6.jpg',
  },
  {
    name: 'Xà phòng diệt khuẩn Lifebuoy (90g x 4)',
    description: 'Xà phòng Lifebuoy diệt khuẩn 99.9%, bảo vệ da khỏi vi khuẩn, combo 4 bánh',
    price: 28000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 60,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product7.jpeg',
  },
  {
    name: 'Tương ớt Chinsu (500g)',
    description: 'Tương ớt Chinsu cay ngọt đậm đà, hương vị đặc trưng Việt Nam',
    price: 32000,
    categoryName: 'Gia vị',
    stock: 70,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product8.jpg',
  },
  {
    name: 'Dao thái cao cấp Elmich (20cm)',
    description: 'Dao thái cao cấp Elmich Diamond, lưỡi dao sắc bén, cán cầm êm tay',
    price: 195000,
    categoryName: 'Đồ gia dụng',
    stock: 35,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product9.jpg',
  },
  {
    name: 'Hộp đựng thực phẩm (bộ 5 chiếc)',
    description: 'Bộ 5 hộp đựng thực phẩm nhựa PP an toàn, kín khí, bảo quản thực phẩm tươi lâu',
    price: 125000,
    categoryName: 'Đồ gia dụng',
    stock: 30,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product10.jpeg',
  },
  {
    name: 'Bình đựng nước 2.5L',
    description: 'Bình đựng nước nhựa trong suốt 2.5L, có vòi rót tiện lợi',
    price: 85000,
    categoryName: 'Đồ gia dụng',
    stock: 40,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product11.jpeg',
  },
  {
    name: 'Giấy vệ sinh Paseo (6 cuộn)',
    description: 'Giấy vệ sinh Paseo Elegant 3 lớp siêu mềm, thấm hút tốt',
    price: 45000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 50,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product12.jpeg',
  },
  {
    name: 'Bột giặt Omo (6kg)',
    description: 'Bột giặt Omo hệ bọt thông minh, khử mùi và diệt khuẩn vượt trội',
    price: 185000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 30,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product13.jpg',
  },
  {
    name: 'Gạo ST25 túi 5kg',
    description: 'Gạo ST25 đặc sản Sóc Trăng thơm dẻo tự nhiên, gạo ngon nhất thế giới 2019',
    price: 180000,
    categoryName: 'Lương thực',
    stock: 100,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product14.jpg',
  },
  {
    name: 'Sữa đặc có đường Ông Thọ (380g)',
    description: 'Sữa đặc Ông Thọ có đường Vinamilk, vị ngọt thơm béo, pha cà phê tuyệt vời',
    price: 25000,
    categoryName: 'Lương thực',
    stock: 50,
    sellerUsername: 'seller_kim',
    imageUrl: '/product/product15.jpg',
  },
  {
    name: 'Sữa chua và Yogurt Vinamilk (combo 4 hộp)',
    description: 'Combo sữa chua và yogurt Vinamilk lên men tự nhiên, tốt cho tiêu hóa',
    price: 32000,
    categoryName: 'Lương thực',
    stock: 60,
    sellerUsername: 'seller_kim',
    imageUrl: '/product/product16.jpeg',
  },
  {
    name: 'Trứng gà ta tươi (10 quả)',
    description: 'Trứng gà ta nuôi thả vườn tự nhiên 100%, giàu dinh dưỡng, an toàn',
    price: 45000,
    categoryName: 'Lương thực',
    stock: 100,
    sellerUsername: 'seller_kim',
    imageUrl: '/product/product17.jpg',
  },
  {
    name: 'Sữa tươi Vinamilk 100% (1 lít)',
    description: 'Sữa tươi Vinamilk 100% không đường, bổ sung canxi và vitamin D',
    price: 32000,
    categoryName: 'Lương thực',
    stock: 80,
    sellerUsername: 'seller_kim',
    imageUrl: '/product/product18.jpeg',
  },
  {
    name: 'Hạt nêm Knorr thịt thăn (400g)',
    description: 'Hạt nêm Knorr từ thịt thăn, xương ống và tủy, tăng vị ngon tự nhiên',
    price: 42000,
    categoryName: 'Gia vị',
    stock: 70,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product19.jpg',
  },
  {
    name: 'Nước rửa chén Sunlight (800ml)',
    description: 'Nước rửa chén Sunlight Extra khử mùi tanh với trà xanh Matcha Nhật Bản',
    price: 35000,
    categoryName: 'Đồ dùng vệ sinh',
    stock: 70,
    sellerUsername: 'seller_lan',
    imageUrl: '/product/product20.png',
  },
  {
    name: 'Cơm hộp Bento Nhật Bản',
    description: 'Cơm hộp Bento kiểu Nhật với thịt cuộn rau củ, trứng và rau sạch, đông lạnh tiện lợi',
    price: 55000,
    categoryName: 'Thực phẩm chế biến',
    stock: 30,
    sellerUsername: 'seller_duc',
    imageUrl: '/product/product21.jpeg',
  },
  {
    name: 'Cháo tươi SG Food (240g)',
    description: 'Cháo tươi SG Food sườn non nấu đậu, ăn liền tiện lợi, chỉ cần hâm nóng',
    price: 18000,
    categoryName: 'Thực phẩm chế biến',
    stock: 60,
    sellerUsername: 'seller_duc',
    imageUrl: '/product/product22.png',
  },
  {
    name: 'Mì ly Hảo Hảo (thùng 24 ly)',
    description: 'Mì ly Hảo Hảo vị tôm chua cay Handy, thùng 24 ly tiện lợi',
    price: 135000,
    categoryName: 'Thực phẩm chế biến',
    stock: 45,
    sellerUsername: 'seller_duc',
    imageUrl: '/product/product23.jpg',
  },
  {
    name: 'Muối i-ốt Bạc Liêu (500g)',
    description: 'Muối i-ốt Bạc Liêu tinh khiết, bổ sung i-ốt tự nhiên, phòng bệnh bướu cổ',
    price: 8000,
    categoryName: 'Gia vị',
    stock: 100,
    sellerUsername: 'seller_minh',
    imageUrl: '/product/product24.jpg',
  },
  {
    name: "Snack Lay's vị tảo biển Nori (56g)",
    description: "Snack khoai tây Lay's vị tảo biển Nori độc đáo, giòn tan thơm ngon",
    price: 18000,
    categoryName: 'Bánh kẹo',
    stock: 80,
    sellerUsername: 'seller_duc',
    imageUrl: '/product/product25.jpg',
  },
  {
    name: 'Chocolate KitKat (45g)',
    description: 'Chocolate KitKat giòn tan với lớp wafer nhiều lớp phủ socola sữa',
    price: 15000,
    categoryName: 'Bánh kẹo',
    stock: 50,
    sellerUsername: 'seller_duc',
    imageUrl: '/product/product26.jpeg',
  },
  {
    name: 'Kẹo dẻo Haribo Goldbären (200g)',
    description: 'Kẹo dẻo Haribo Goldbären hình gấu vàng nhập khẩu Đức, nhiều hương vị trái cây',
    price: 85000,
    categoryName: 'Bánh kẹo',
    stock: 40,
    sellerUsername: 'seller_duc',
    imageUrl: '/product/product27.jpeg',
  },
  {
    name: 'Bánh quy Cosy Marie (240g)',
    description: 'Bánh quy sữa Cosy Marie giòn tan thơm bơ, hộp 10 gói tiện lợi',
    price: 48000,
    categoryName: 'Bánh kẹo',
    stock: 60,
    sellerUsername: 'seller_duc',
    imageUrl: '/product/product28.jpg',
  },
  {
    name: 'Rượu vang đỏ Ochoa Gran Reserva',
    description: 'Rượu vang đỏ Tây Ban Nha Ochoa 10 Gran Reserva cao cấp, độ cồn 13.5%',
    price: 450000,
    categoryName: 'Đồ uống',
    stock: 15,
    sellerUsername: 'seller_tung',
    imageUrl: '/product/product29.png',
  },
  {
    name: 'Nước suối Lavie (1 lít)',
    description: 'Nước suối Lavie 1 lít tinh khiết, nguồn nước thiên nhiên sạch',
    price: 6000,
    categoryName: 'Đồ uống',
    stock: 150,
    sellerUsername: 'seller_tung',
    imageUrl: '/product/product30.jpg',
  },
  {
    name: 'Bia Heineken thùng 24 lon',
    description: 'Bia Heineken nhập khẩu chính hãng 330ml, thùng 24 lon',
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
    name: 'Trà xanh không độ C2 (500ml)',
    description: 'Trà xanh không độ C2 hương chanh sả, không đường, không calo',
    price: 8000,
    categoryName: 'Đồ uống',
    stock: 120,
    sellerUsername: 'seller_tung',
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
    const reviewRepo = dataSource.getRepository(Review);
    const orderItemRepo = dataSource.getRepository(OrderItem);
    const orderRepo = dataSource.getRepository(Order);
    const favoriteRepo = dataSource.getRepository(Favorite);
    const sellerStatsRepo = dataSource.getRepository(SellerStats);

    // Clear existing data using TRUNCATE CASCADE
    console.log('🗑️  Clearing existing data...');
    await dataSource.query('TRUNCATE TABLE "review" CASCADE');
    console.log('   ✅ Cleared reviews');
    await dataSource.query('TRUNCATE TABLE "order_item" CASCADE');
    console.log('   ✅ Cleared order items');
    await dataSource.query('TRUNCATE TABLE "order" CASCADE');
    console.log('   ✅ Cleared orders');
    await dataSource.query('TRUNCATE TABLE "favorite" CASCADE');
    console.log('   ✅ Cleared favorites');
    await dataSource.query('TRUNCATE TABLE "product" CASCADE');
    console.log('   ✅ Cleared products');
    await dataSource.query('TRUNCATE TABLE "category" CASCADE');
    console.log('   ✅ Cleared categories');
    await dataSource.query('TRUNCATE TABLE "seller_stats" CASCADE');
    console.log('   ✅ Cleared seller stats');
    await dataSource.query('TRUNCATE TABLE "seller" CASCADE');
    console.log('   ✅ Cleared sellers');
    await dataSource.query('TRUNCATE TABLE "buyer" CASCADE');
    console.log('   ✅ Cleared buyers');
    await dataSource.query('TRUNCATE TABLE "user" CASCADE');
    console.log('   ✅ Cleared users from database');

    // Delete users from Supabase Auth
    console.log('   🔐 Clearing Supabase Auth users...');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // List all users and delete them
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError && users) {
      for (const user of users) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      console.log(`   ✅ Deleted ${users.length} users from Supabase Auth`);
    }

    console.log('✅ All existing data cleared');

    // Initialize Supabase client for seeding
    console.log('🔐 Supabase client initialized for seeding');

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
          avatar: userFields.avatar === null ? undefined : userFields.avatar,
        });

        const savedUser: User = await userRepo.save(user);
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
        imageUrl: (productData as any).imageUrl || null,
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
    console.log(
      'Thực Phẩm Sạch: huong@foodee.com / 123456 (Thực Phẩm Sạch Hương)',
    );
    console.log(
      'Siêu Thị Mini: duc@foodee.com / 123456 (Siêu Thị Mini Đức Long)',
    );
    console.log(
      'Đồ Gia Dụng: lan@foodee.com / 123456 (Cửa Hàng Gia Dụng Lan Anh)',
    );
    console.log(
      'Nhập Khẩu: tung@foodee.com / 123456 (Thực Phẩm Nhập Khẩu Tùng)',
    );
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
