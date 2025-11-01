import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { Product } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  category: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number = 0;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number = 0;

  @IsString()
  @IsOptional()
  tags?: string; // JSON string of tags

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class ProductResponseDto {
  id: number;
  sellerId: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  discountedPrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  stock: number;
  discount: number;

  // Relations
  seller: {
    id: string;
    shopName?: string;
    user: {
      name: string;
      address?: string;
      phone?: string;
    };
  };

  // Optional aggregated data
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;

  constructor(product: Product) {
    this.id = product.id;
    this.sellerId = product.sellerId;
    this.category = product.category;
    this.name = product.name;
    this.description = product.description;
    this.price = Number(product.price);
    this.discount = product.discount || 0;
    this.discountedPrice =
      this.discount > 0
        ? Math.max(0, (Number(product.price) * (100 - this.discount)) / 100)
        : Number(product.price);
    this.imageUrl = product.imageUrl;
    this.isAvailable = product.isAvailable;
    this.stock = product.stock || 0;

    this.seller = {
      id: product.seller?.id || '',
      shopName: product.seller?.shopName,
      user: {
        name: product.seller?.user?.name || '',
        address: product.seller?.user?.address,
        phone: product.seller?.user?.phone,
      },
    };

    this.averageRating = Number(product.averageRating) || 0;
    this.totalReviews = product.totalReviews || 0;
    this.totalSold = product.totalSold || 0;
  }
}

// ✅ Detailed DTO for single product view (when you need full details)
export class ProductDetailDto extends ProductResponseDto {
  constructor(product: Product) {
    super(product);
  }
}
