import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  buyerId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class ReviewResponseDto {
  id: number;
  userId: number;
  buyerId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
  };
  buyer: {
    id: number;
  };
  product: {
    id: number;
    name: string;
    imageUrl?: string;
    seller: {
      id: number;
      shopName?: string;
    };
  };

  constructor(review: any) {
    this.id = review.id;
    this.userId = review.userId;
    this.buyerId = review.buyerId;
    this.productId = review.productId;
    this.rating = review.rating;
    this.comment = review.comment;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;

    this.user = {
      id: review.user.id,
      name: review.user.name,
      username: review.user.username,
      avatar: review.user.avatar,
    };

    this.buyer = {
      id: review.buyer.id,
    };

    this.product = {
      id: review.product.id,
      name: review.product.name,
      imageUrl: review.product.imageUrl,
      seller: {
        id: review.product.seller.id,
        shopName: review.product.seller.shopName,
      },
    };
  }
}
