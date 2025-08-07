import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { Review } from './review/entities/review.entity';
import { Product } from './product/entities/product.entity';
import { Buyer } from './user/entities/buyer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function createSampleReview() {
  console.log('🌱 Creating sample review...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const reviewRepository = app.get<Repository<Review>>(getRepositoryToken(Review));
  const productRepository = app.get<Repository<Product>>(getRepositoryToken(Product));
  const buyerRepository = app.get<Repository<Buyer>>(getRepositoryToken(Buyer));

  try {
    // Tìm product và buyer
    const product = await productRepository.findOne({ where: { id: 1 } });
    const buyer = await buyerRepository.findOne({ 
      where: {},
      relations: ['user']
    });

    if (!product) {
      console.log('❌ Product not found');
      return;
    }

    if (!buyer) {
      console.log('❌ Buyer not found');
      return;
    }

    console.log(`✅ Found buyer with ID: ${buyer.id}, userId: ${buyer.userId}`);

    // Kiểm tra đã có review chưa
    const existingReview = await reviewRepository.findOne({
      where: { productId: 1, buyerId: buyer.id }
    });

    if (existingReview) {
      console.log('ℹ️ Review already exists');
      return;
    }

    // Tạo review mới
    const review = reviewRepository.create({
      userId: buyer.userId,
      productId: product.id,
      buyerId: buyer.id,
      rating: 5,
      comment: 'Bánh mì rất ngon, thịt nướng thơm lừng và rau củ tươi mát. Sẽ quay lại ủng hộ!',
    });

    await reviewRepository.save(review);
    console.log('✅ Created sample review for product 1');

    // Tạo thêm một review nữa với rating khác
    const review2 = reviewRepository.create({
      productId: product.id,
      buyerId: buyer.id,
      rating: 4,
      comment: 'Bánh mì tốt, giá cả hợp lý. Nhưng có thể cải thiện phần rau thêm một chút.',
    });

    // await reviewRepository.save(review2);
    // console.log('✅ Created second sample review for product 1');

  } catch (error) {
    console.error('❌ Error creating sample review:', error);
  } finally {
    await app.close();
  }
}

createSampleReview();
