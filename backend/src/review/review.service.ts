import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../product/entities/product.entity';
import { Buyer } from '../user/entities/buyer.entity';
import { CreateReviewDto, UpdateReviewDto, ReviewResponseDto } from './dto/review.dto';

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

  async createReview(createReviewDto: CreateReviewDto, userId: number): Promise<ReviewResponseDto> {
    // Tìm buyer từ userId
    const buyer = await this.buyerRepository.findOne({
      where: { userId: userId },
      relations: ['user']
    });
    if (!buyer) {
      throw new NotFoundException('Không tìm thấy thông tin buyer');
    }

    // Kiểm tra product có tồn tại
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId }
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Kiểm tra buyer đã review sản phẩm này chưa
    const existingReview = await this.reviewRepository.findOne({
      where: {
        productId: createReviewDto.productId,
        buyerId: buyer.id
      }
    });
    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Tạo review mới
    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId: buyer.userId,
      buyerId: buyer.id
    });

    const savedReview = await this.reviewRepository.save(review);
    
    // Lấy review với relations để trả về
    const reviewWithRelations = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: ['buyer', 'buyer.user', 'product', 'product.seller']
    });

    return new ReviewResponseDto(reviewWithRelations);
  }

  async getProductReviews(productId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['buyer', 'buyer.user', 'product', 'product.seller'],
      order: { createdAt: 'DESC' }
    });

    return reviews.map(review => new ReviewResponseDto(review));
  }

  async updateReview(id: number, updateReviewDto: UpdateReviewDto, userId: number): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id, userId },
      relations: ['buyer', 'buyer.user', 'product', 'product.seller']
    });

    if (!review) {
      throw new NotFoundException(`Review not found or unauthorized`);
    }

    // Verify ownership by checking userId through buyer relation
    if (review.buyer.userId !== userId) {
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
    return new ReviewResponseDto(updatedReview);
  }

  async deleteReview(id: number, userId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['buyer']
    });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    // Verify ownership by checking userId through buyer relation
    if (review.buyer.userId !== userId) {
      throw new UnauthorizedException('Bạn chỉ có thể xóa review của chính mình');
    }

    await this.reviewRepository.remove(review);
  }

  async getProductRatingStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.reviewRepository.find({
      where: { productId }
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Number((totalRating / totalReviews).toFixed(1));

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution
    };
  }
}
