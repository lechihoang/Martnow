import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
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

    // Defensive checks for buyer and user
    this.user = {
      id: review.buyer?.user?.id || 0,
      name: review.buyer?.user?.name || '',
      username: review.buyer?.user?.username || '',
      avatar: review.buyer?.user?.avatar,
    };

    this.buyer = {
      id: review.buyer?.id || 0,
    };

    // Defensive checks for product and seller
    this.product = {
      id: review.product?.id || 0,
      name: review.product?.name || '',
      imageUrl: review.product?.imageUrl,
      seller: {
        id: review.product?.seller?.id || 0,
        shopName: review.product?.seller?.shopName,
      },
    };
  }
}
