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

// ✅ Simplified ReviewResponseDto - Remove redundant fields and complex nesting
export class ReviewResponseDto {
  id: number;
  productId: number;
  rating: number;
  comment?: string;
  helpfulCount: number;
  createdAt: Date;
  
  // Essential user info only
  buyerName: string;
  buyerAvatar?: string;
  
  // Essential product info only
  productName: string;
  
  constructor(review: any) {
    this.id = review.id;
    this.productId = review.productId;
    this.rating = review.rating;
    this.comment = review.comment;
    this.helpfulCount = review.helpfulCount || 0;
    this.createdAt = review.createdAt;
    
    // ✅ Simple buyer info from nested relation
    this.buyerName = review.buyer?.user?.name || 'Anonymous';
    this.buyerAvatar = review.buyer?.user?.avatar;
    
    // ✅ Simple product info
    this.productName = review.product?.name || '';
  }
}

// ✅ Detailed DTO for review management (admin/owner view)
export class ReviewDetailDto extends ReviewResponseDto {
  buyerId: number;
  buyer: {
    id: number;
    user: { name: string; username: string; email: string };
  };
  product: {
    id: number;
    name: string;
    seller: { id: number; shopName?: string };
  };
  
  constructor(review: any) {
    super(review);
    
    this.buyerId = review.buyerId;
    this.buyer = {
      id: review.buyer?.id || 0,
      user: {
        name: review.buyer?.user?.name || '',
        username: review.buyer?.user?.username || '',
        email: review.buyer?.user?.email || '',
      },
    };
    
    this.product = {
      id: review.product?.id || 0,
      name: review.product?.name || '',
      seller: {
        id: review.product?.seller?.id || 0,
        shopName: review.product?.seller?.shopName,
      },
    };
  }
}
