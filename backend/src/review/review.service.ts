import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async createReview(createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Kiểm tra product có tồn tại
    const product = await this.productRepository.findOne({
      where: { id: createReviewDto.productId }
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Kiểm tra buyer có tồn tại
    const buyer = await this.buyerRepository.findOne({
      where: { id: createReviewDto.buyerId },
      relations: ['user']
    });
    if (!buyer) {
      throw new NotFoundException('Buyer không tồn tại');
    }

    // Kiểm tra buyer đã review sản phẩm này chưa
    const existingReview = await this.reviewRepository.findOne({
      where: {
        productId: createReviewDto.productId,
        buyerId: createReviewDto.buyerId
      }
    });
    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Tạo review mới
    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId: buyer.userId
    });

    const savedReview = await this.reviewRepository.save(review);
    
    // Lấy review với relations để trả về
    const reviewWithRelations = await this.reviewRepository.findOne({
      where: { id: savedReview.id },
      relations: ['buyer', 'buyer.user', 'product']
    });

    return new ReviewResponseDto(reviewWithRelations);
  }

  async getProductReviews(productId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['buyer', 'buyer.user', 'product'],
      order: { createdAt: 'DESC' }
    });

    return reviews.map(review => new ReviewResponseDto(review));
  }

  async updateReview(id: number, updateReviewDto: UpdateReviewDto, buyerId: number): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id, buyerId },
      relations: ['buyer', 'buyer.user', 'product']
    });

    if (!review) {
      throw new NotFoundException('Review không tồn tại hoặc bạn không có quyền chỉnh sửa');
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

  async deleteReview(id: number, buyerId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id, buyerId }
    });

    if (!review) {
      throw new NotFoundException('Review không tồn tại hoặc bạn không có quyền xóa');
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
