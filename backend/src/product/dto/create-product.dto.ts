import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';

export interface ImageData {
  imageData: string;
  mimeType: string;
  originalName: string;
  fileSize: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  images?: ImageData[]; // Array of image data objects

  @IsNumber()
  sellerId: number;

  @IsNumber()
  categoryId: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;
}

export class ProductResponseDto {
  id: number;
  sellerId: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  stock: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: number;
    shopName?: string;
    shopAddress?: string;
    user: {
      name: string;
      username: string;
    };
  };
  category: {
    id: number;
    name: string;
    description?: string;
  };
  images: {
    id: number;
    imageData: string;
    mimeType: string;
    originalName: string;
    isPrimary: boolean;
    displayOrder: number;
  }[];
  reviews: {
    id: number;
    rating: number;
    comment?: string;
    createdAt: Date;
    user: {
      name: string;
      username: string;
      avatar?: string;
    };
  }[];
  averageRating: number;
  totalReviews: number;
  totalSold: number;

  constructor(product: any) {
    this.id = product.id;
    this.sellerId = product.sellerId;
    this.categoryId = product.categoryId;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.imageUrl = product.imageUrl;
    this.isAvailable = product.isAvailable;
    this.stock = product.stock;
    this.discount = product.discount;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;

    this.seller = {
      id: product.seller.id,
      shopName: product.seller.shopName,
      shopAddress: product.seller.shopAddress,
      user: {
        name: product.seller.user.name,
        username: product.seller.user.username,
      },
    };

    this.category = {
      id: product.category.id,
      name: product.category.name,
      description: product.category.description,
    };

    this.images = product.images?.map((img: any) => ({
      id: img.id,
      imageData: img.imageData,
      mimeType: img.mimeType,
      originalName: img.originalName,
      isPrimary: img.isPrimary,
      displayOrder: img.displayOrder,
    })) || [];

    // Set imageUrl từ ảnh primary hoặc ảnh đầu tiên
    const primaryImage = this.images.find(img => img.isPrimary) || this.images[0];
    this.imageUrl = primaryImage ? primaryImage.imageData : undefined;

    this.reviews = product.reviews?.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        name: review.user.name,
        username: review.user.username,
        avatar: review.user.avatar,
      },
    })) || [];

    // Calculate stats
    this.totalReviews = this.reviews.length;
    this.averageRating = this.totalReviews > 0 
      ? Number((this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.totalReviews).toFixed(1))
      : 0;
    
    this.totalSold = product.orderItems?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
  }
}
