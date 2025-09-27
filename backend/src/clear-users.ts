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
import { SellerStats } from './seller-stats/entities/seller-stats.entity';
import { Blog } from './blog/entities/blog.entity';
import { BlogComment } from './blog/entities/blog-comment.entity';
import { BlogVote } from './blog/entities/blog-vote.entity';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

async function clearAllData() {
  console.log('🧹 Clearing all data from PostgreSQL database...');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      User,
      Buyer,
      Seller,
      Product,
      Category,
      Review,
      Order,
      OrderItem,
      Favorite,
      SellerStats,
      Blog,
      BlogComment,
      BlogVote,
    ],
    synchronize: false,
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
    const productRepo = dataSource.getRepository(Product);
    const categoryRepo = dataSource.getRepository(Category);
    const reviewRepo = dataSource.getRepository(Review);
    const orderRepo = dataSource.getRepository(Order);
    const orderItemRepo = dataSource.getRepository(OrderItem);
    const favoriteRepo = dataSource.getRepository(Favorite);
    const sellerStatsRepo = dataSource.getRepository(SellerStats);
    const blogRepo = dataSource.getRepository(Blog);
    const blogCommentRepo = dataSource.getRepository(BlogComment);
    const blogVoteRepo = dataSource.getRepository(BlogVote);

    // Delete all data in reverse order of dependencies
    console.log('🗑️ Deleting all data...');

    // 0. Delete blog related data first
    const blogVoteResult = await blogVoteRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${blogVoteResult.affected} blog votes`);

    const blogCommentResult = await blogCommentRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${blogCommentResult.affected} blog comments`);

    const blogResult = await blogRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${blogResult.affected} blogs`);

    // 1. Delete order items first (depends on orders and products)
    const orderItemResult = await orderItemRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${orderItemResult.affected} order items`);

    // 2. Delete orders (depends on users)
    const orderResult = await orderRepo.createQueryBuilder().delete().execute();
    console.log(`✅ Deleted ${orderResult.affected} orders`);

    // 3. Delete favorites (depends on users and products)
    const favoriteResult = await favoriteRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${favoriteResult.affected} favorites`);

    // 4. Delete reviews (depends on users and products)
    const reviewResult = await reviewRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${reviewResult.affected} reviews`);

    // 5. Delete products (depends on categories and sellers)
    const productResult = await productRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${productResult.affected} products`);

    // 6. Delete seller stats (depends on sellers)
    const sellerStatsResult = await sellerStatsRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${sellerStatsResult.affected} seller stats`);

    // 7. Delete buyers and sellers (depends on users)
    const buyerResult = await buyerRepo.createQueryBuilder().delete().execute();
    console.log(`✅ Deleted ${buyerResult.affected} buyers`);

    const sellerResult = await sellerRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${sellerResult.affected} sellers`);

    // 8. Delete users
    const userResult = await userRepo.createQueryBuilder().delete().execute();
    console.log(`✅ Deleted ${userResult.affected} users`);

    // 9. Delete categories
    const categoryResult = await categoryRepo
      .createQueryBuilder()
      .delete()
      .execute();
    console.log(`✅ Deleted ${categoryResult.affected} categories`);

    console.log('✅ All data cleared successfully from database');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

clearAllData();
