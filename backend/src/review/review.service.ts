import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../product/entities/product.entity';
import { Buyer } from '../account/buyer/entities/buyer.entity';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewResponseDto,
} from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<ReviewResponseDto> {
    // Tìm buyer từ userId (buyer.id chính là userId)
    const buyer = await this.buyerRepository.findOne({
      where: { id: userId },
      relations: ['user'],
    });
    if (!buyer) {
      throw new NotFoundException('Không tìm thấy thông tin buyer');
    }

    // ✅ Optimized: Bulk check product existence and existing review
    const [product, existingReview] = await Promise.all([
      this.productRepository.findOne({
        where: { id: createReviewDto.productId },
      }),
      this.reviewRepository.findOne({
        where: {
          productId: createReviewDto.productId,
          buyerId: buyer.id,
        },
      }),
    ]);

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Tạo review mới (không cần userId nữa)
    const review = this.reviewRepository.create({
      ...createReviewDto,
      buyerId: buyer.id,
    });

    const savedReview = await this.reviewRepository.save(review);

    // ✅ Cập nhật product statistics
    await this.updateProductStatistics(createReviewDto.productId);

    // Lấy review với relations để trả về
    const reviewWithRelations = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: ['buyer', 'buyer.user', 'product', 'product.seller'],
    });

    if (!reviewWithRelations) {
      throw new NotFoundException('Failed to retrieve created review');
    }

    return new ReviewResponseDto(reviewWithRelations);
  }

  async getProductReviews(productId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['buyer', 'buyer.user', 'product', 'product.seller'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => new ReviewResponseDto(review));
  }

  async updateReview(
    id: number,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<ReviewResponseDto> {
    // ✅ Fixed: Remove userId from where clause and check ownership through buyer relation
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['buyer', 'buyer.user', 'product', 'product.seller'],
    });

    if (!review) {
      throw new NotFoundException(`Review not found`);
    }

    // Verify ownership by checking buyer.id (which is userId)
    if (review.buyer.id !== userId) {
      throw new UnauthorizedException('You can only update your own reviews');
    }

    // Update fields
    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }
    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    const updatedReview = await this.reviewRepository.save(review);

    // ✅ Cập nhật product statistics khi review được update
    await this.updateProductStatistics(review.productId);

    return new ReviewResponseDto(updatedReview);
  }

  async deleteReview(id: number, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['buyer', 'buyer.user'],
    });

    if (!review) {
      throw new NotFoundException(`Review not found`);
    }

    // Verify ownership by checking buyer.id (which is userId)
    if (review.buyer.id !== userId) {
      throw new UnauthorizedException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);

    // ✅ Cập nhật product statistics khi review được xóa
    await this.updateProductStatistics(review.productId);
  }

  async getProductRatingStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Number((totalRating / totalReviews).toFixed(1));

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  }

  // ✅ Tăng helpful count cho review
  async incrementHelpfulCount(
    reviewId: number,
  ): Promise<{ helpfulCount: number }> {
    await this.reviewRepository.increment({ id: reviewId }, 'helpfulCount', 1);

    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    return {
      helpfulCount: review?.helpfulCount || 0,
    };
  }

  // ✅ Lấy top reviews theo helpful count
  async getTopProductReviews(
    productId: number,
    limit: number = 5,
  ): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['buyer', 'buyer.user', 'product', 'product.seller'],
      order: {
        helpfulCount: 'DESC',
        createdAt: 'DESC',
      },
      take: limit,
    });

    return reviews.map((review) => new ReviewResponseDto(review));
  }

  // ✅ Cập nhật product statistics tự động
  private async updateProductStatistics(productId: number): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
    });

    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      averageRating = Number((totalRating / totalReviews).toFixed(2));
    }

    // Cập nhật cached statistics trong product entity
    await this.productRepository.update(productId, {
      averageRating,
      totalReviews,
    });
  }
}
