import { UserRole, OrderStatus, ProductStatus } from '@/types/entities';
import type { 
  CreateUserDto, 
  CreateSellerDto, 
  CreateBuyerDto,
  CreateProductDto,
  UserResponseDto,
  SellerResponseDto,
  BuyerResponseDto,
  ProductResponseDto
} from '@/types/dtos';

// Mock API functions (thay thế bằng real API calls)
const mockApiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Categories data
const categories = [
  { id: 1, name: 'Bánh mì', description: 'Các loại bánh mì truyền thống và hiện đại' },
  { id: 2, name: 'Đồ uống', description: 'Nước uống, trà, cà phê' },
  { id: 3, name: 'Bánh ngọt', description: 'Bánh kem, bánh bông lan, bánh su kem' },
  { id: 4, name: 'Món chính', description: 'Cơm, phở, bún' },
  { id: 5, name: 'Snack', description: 'Đồ ăn vặt, kẹo, bánh quy' }
];

// Product data for seeding - phù hợp với backend entity
const productData = [
  // Bánh mì
  { name: 'Bánh mì thịt nướng', description: 'Bánh mì thịt nướng thơm ngon, ăn kèm rau sống', price: 25000, categoryId: 1, stock: 50, discount: 0 },
  { name: 'Bánh mì pate', description: 'Bánh mì pate truyền thống với chả lụa', price: 20000, categoryId: 1, stock: 40, discount: 5 },
  { name: 'Bánh mì chả cá', description: 'Bánh mì chả cá Nha Trang đặc biệt', price: 30000, categoryId: 1, stock: 35, discount: 10 },
  { name: 'Bánh mì xíu mại', description: 'Bánh mì xíu mại sốt cà chua', price: 28000, categoryId: 1, stock: 45, discount: 0 },
  
  // Đồ uống
  { name: 'Trà sữa trân châu', description: 'Trà sữa trân châu đường đen thơm ngon', price: 35000, categoryId: 2, stock: 60, discount: 15 },
  { name: 'Cà phê đen đá', description: 'Cà phê phin truyền thống', price: 15000, categoryId: 2, stock: 80, discount: 0 },
  { name: 'Nước chanh dây', description: 'Nước chanh dây tươi mát', price: 18000, categoryId: 2, stock: 50, discount: 8 },
  { name: 'Sinh tố bơ', description: 'Sinh tố bơ béo ngậy', price: 25000, categoryId: 2, stock: 30, discount: 0 },
  
  // Bánh ngọt
  { name: 'Bánh flan', description: 'Bánh flan caramel mềm mịn', price: 12000, categoryId: 3, stock: 25, discount: 0 },
  { name: 'Bánh tiramisu', description: 'Bánh tiramisu Ý chính hiệu', price: 45000, categoryId: 3, stock: 20, discount: 20 },
  { name: 'Bánh red velvet', description: 'Bánh red velvet với cream cheese', price: 38000, categoryId: 3, stock: 15, discount: 12 },
  { name: 'Bánh chocolate lava', description: 'Bánh chocolate lava nóng hổi', price: 32000, categoryId: 3, stock: 18, discount: 0 },
  
  // Món chính
  { name: 'Cơm tấm sườn nướng', description: 'Cơm tấm sườn nướng đặc biệt', price: 55000, categoryId: 4, stock: 40, discount: 0 },
  { name: 'Phở bò tái', description: 'Phở bò tái truyền thống Hà Nội', price: 50000, categoryId: 4, stock: 35, discount: 10 },
  { name: 'Bún bò Huế', description: 'Bún bò Huế cay nồng đậm đà', price: 48000, categoryId: 4, stock: 30, discount: 0 },
  { name: 'Cơm gà Hải Nam', description: 'Cơm gà Hải Nam thơm ngon', price: 52000, categoryId: 4, stock: 25, discount: 15 },
  
  // Snack
  { name: 'Bánh tráng nướng', description: 'Bánh tráng nướng Đà Lạt', price: 8000, categoryId: 5, stock: 100, discount: 0 },
  { name: 'Chè thái', description: 'Chè thái nhiều màu sắc', price: 22000, categoryId: 5, stock: 40, discount: 5 },
  { name: 'Bánh xèo mini', description: 'Bánh xèo mini giòn rụm', price: 15000, categoryId: 5, stock: 60, discount: 0 },
  { name: 'Nem nướng Nha Trang', description: 'Nem nướng Nha Trang chấm tương', price: 35000, categoryId: 5, stock: 45, discount: 8 }
];

class SeedService {
  private users: UserResponseDto[] = [];
  private sellers: SellerResponseDto[] = [];
  private buyers: BuyerResponseDto[] = [];
  private products: ProductResponseDto[] = [];

  // Mock user creation - phù hợp với UserResponseDto
  private async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    await mockApiDelay(100);
    
    const user: UserResponseDto = {
      id: this.users.length + 1,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
      // buyerInfo và sellerInfo sẽ được thêm sau khi tạo buyer/seller
    };

    this.users.push(user);
    console.log(`✅ Created user: ${user.username} (${user.role})`);
    return user;
  }

  // Mock seller creation - phù hợp với SellerResponseDto và backend entity
  private async createSeller(user: UserResponseDto, sellerData: CreateSellerDto): Promise<SellerResponseDto> {
    await mockApiDelay(100);
    
    const seller: SellerResponseDto = {
      id: this.sellers.length + 1,
      userId: user.id,
      shopName: sellerData.shopName,
      shopAddress: sellerData.shopAddress,
      shopPhone: sellerData.shopPhone,
      description: sellerData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      totalProducts: 0,
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        completionRate: 0
      }
    };

    // Update user with sellerInfo
    const userToUpdate = this.users.find(u => u.id === user.id);
    if (userToUpdate) {
      userToUpdate.sellerInfo = {
        id: seller.id,
        shopName: seller.shopName,
        shopAddress: seller.shopAddress,
        shopPhone: seller.shopPhone,
        description: seller.description,
        createdAt: seller.createdAt
      };
    }

    this.sellers.push(seller);
    console.log(`✅ Created seller: ${seller.shopName}`);
    return seller;
  }

  // Mock buyer creation - phù hợp với BuyerResponseDto và backend entity
  private async createBuyer(user: UserResponseDto, buyerData: CreateBuyerDto): Promise<BuyerResponseDto> {
    await mockApiDelay(100);
    
    const buyer: BuyerResponseDto = {
      id: this.buyers.length + 1,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      totalOrders: 0,
      totalReviews: 0
    };

    // Update user with buyerInfo
    const userToUpdate = this.users.find(u => u.id === user.id);
    if (userToUpdate) {
      userToUpdate.buyerInfo = {
        id: buyer.id,
        createdAt: buyer.createdAt
      };
    }

    this.buyers.push(buyer);
    console.log(`✅ Created buyer: ${buyer.user.name}`);
    return buyer;
  }

  // Mock product creation - phù hợp với ProductResponseDto và backend entity
  private async createProduct(productData: CreateProductDto, seller: SellerResponseDto): Promise<ProductResponseDto> {
    await mockApiDelay(50);
    
    const category = categories.find(c => c.id === productData.categoryId);
    const product: ProductResponseDto = {
      id: this.products.length + 1,
      sellerId: productData.sellerId,
      categoryId: productData.categoryId,
      name: productData.name,
      description: productData.description || "",
      price: productData.price,
      imageUrl: productData.imageUrl || `/images/products/product-${this.products.length + 1}.jpg`,
      isAvailable: productData.isAvailable ?? true,
      stock: productData.stock,
      discount: productData.discount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      seller: {
        id: seller.id,
        shopName: seller.shopName,
        shopAddress: seller.shopAddress,
        user: {
          name: seller.user.name,
          username: seller.user.username
        }
      },
      category: {
        id: category!.id,
        name: category!.name,
        description: category!.description
      },
      images: [
        {
          id: 1,
          imageUrl: productData.imageUrl || `/images/products/product-${this.products.length + 1}.jpg`
        }
      ],
      reviews: [],
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
      totalReviews: Math.floor(Math.random() * 20),
      totalSold: Math.floor(Math.random() * 100)
    };

    this.products.push(product);
    return product;
  }

  // Seed main function
  async seedDatabase(): Promise<void> {
    console.log('🌱 Starting database seeding...\n');

    try {
      // 1. Create Buyer User
      console.log('👤 Creating buyer user...');
      const buyerUser = await this.createUser({
        name: 'Nguyễn Văn An',
        username: 'buyer_an',
        email: 'buyer@foodee.com',
        password: 'password123',
        role: UserRole.BUYER,
        avatar: '/images/avatars/buyer-avatar.jpg'
      });

      // 2. Create Buyer Profile
      const buyer = await this.createBuyer(buyerUser, {
        userId: buyerUser.id
      });

      // 3. Create Seller User
      console.log('\n🏪 Creating seller user...');
      const sellerUser = await this.createUser({
        name: 'Trần Thị Bình',
        username: 'seller_binh',
        email: 'seller@foodee.com',
        password: 'password123',
        role: UserRole.SELLER,
        avatar: '/images/avatars/seller-avatar.jpg'
      });

      // 4. Create Seller Profile
      const seller = await this.createSeller(sellerUser, {
        userId: sellerUser.id,
        shopName: 'Quán Ăn Ngon Bình',
        shopAddress: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        shopPhone: '0901234567',
        description: 'Quán ăn gia đình với các món ăn truyền thống Việt Nam. Được thành lập từ năm 2020, chúng tôi luôn cam kết mang đến những món ăn chất lượng, tươi ngon với giá cả hợp lý.'
      });

      // 5. Create 20 Products for Seller
      console.log('\n🍽️ Creating 20 products for seller...');
      const products: ProductResponseDto[] = [];
      
      for (let i = 0; i < productData.length; i++) {
        const data = productData[i];
        const product = await this.createProduct({
          sellerId: seller.id,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          isAvailable: true,
          discount: data.discount // Sử dụng discount từ dữ liệu
        }, seller);
        
        products.push(product);
        console.log(`   📦 Product ${i + 1}/20: ${product.name} - ${product.price.toLocaleString('vi-VN')}đ`);
      }

      // 6. Update seller stats
      const updatedSeller = this.sellers.find(s => s.id === seller.id);
      if (updatedSeller) {
        updatedSeller.totalProducts = products.length;
        updatedSeller.stats = {
          totalOrders: Math.floor(Math.random() * 50) + 10,
          totalRevenue: products.reduce((sum, p) => sum + (p.price * p.totalSold), 0),
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
          completionRate: Math.round((Math.random() * 30 + 70) * 10) / 10 // 70% - 100%
        };
      }

      console.log('\n✅ Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   • Users created: ${this.users.length}`);
      console.log(`   • Buyers created: ${this.buyers.length}`);
      console.log(`   • Sellers created: ${this.sellers.length}`);
      console.log(`   • Products created: ${this.products.length}`);
      console.log(`   • Total revenue: ${updatedSeller?.stats?.totalRevenue?.toLocaleString('vi-VN')}đ`);

    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  // Getter methods to access seeded data
  getUsers(): UserResponseDto[] {
    return this.users;
  }

  getSellers(): SellerResponseDto[] {
    return this.sellers;
  }

  getBuyers(): BuyerResponseDto[] {
    return this.buyers;
  }

  getProducts(): ProductResponseDto[] {
    return this.products;
  }

  // Get specific data
  getBuyerUser(): UserResponseDto | undefined {
    return this.users.find(u => u.role === UserRole.BUYER);
  }

  getSellerUser(): UserResponseDto | undefined {
    return this.users.find(u => u.role === UserRole.SELLER);
  }

  getSellerProducts(sellerId: number): ProductResponseDto[] {
    return this.products.filter(p => p.sellerId === sellerId);
  }
}

// Export seeder instance
export const seeder = new SeedService();

// Export function to run seeding
export async function runSeed(): Promise<void> {
  await seeder.seedDatabase();
}

// Export data access functions
export function getSeedData() {
  return {
    users: seeder.getUsers(),
    sellers: seeder.getSellers(),
    buyers: seeder.getBuyers(),
    products: seeder.getProducts(),
    buyerUser: seeder.getBuyerUser(),
    sellerUser: seeder.getSellerUser()
  };
}

// Helper function to get products by category
export function getProductsByCategory(categoryId: number): ProductResponseDto[] {
  return seeder.getProducts().filter(p => p.categoryId === categoryId);
}

// Helper function to get seller stats
export function getSellerStats(sellerId: number) {
  const seller = seeder.getSellers().find(s => s.id === sellerId);
  return seller?.stats;
}

// If running this file directly (for testing)
if (typeof require !== 'undefined' && require.main === module) {
  runSeed()
    .then(() => {
      console.log('\n🎉 Seed completed! You can now use the seeded data in your application.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error);
      process.exit(1);
    });
}
