import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsPositive,
  Min,
  Max,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  categoryId: number;

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
}

export class ProductResponseDto {
  id: number;
  sellerId: number;
  categoryId: number;
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
    id: number;
    shopName?: string;
    shopAddress?: string;
    user: {
      name: string;
    };
  };
  category: {
    id: number;
    name: string;
    description?: string;
  };

  // Optional aggregated data
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;

  constructor(product: any) {
    this.id = product.id;
    this.sellerId = product.sellerId;
    this.categoryId = product.categoryId;
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
      id: product.seller?.id,
      shopName: product.seller?.shopName,
      shopAddress: product.seller?.shopAddress,
      user: {
        name: product.seller?.user?.name || '',
      },
    };

    this.category = {
      id: product.category?.id,
      name: product.category?.name || '',
      description: product.category?.description,
    };

    this.averageRating = product.averageRating || 0;
    this.totalReviews = product.totalReviews || 0;
    this.totalSold = product.totalSold || 0;
  }
}

// ✅ Detailed DTO for single product view (when you need full details)
export class ProductDetailDto extends ProductResponseDto {
  seller: {
    id: number;
    shopName?: string;
    shopAddress?: string;
    user: { name: string; username: string };
  };
  category: { id: number; name: string; description?: string };
  constructor(product: any) {
    super(product);

    this.seller = {
      id: product.seller?.id,
      shopName: product.seller?.shopName,
      shopAddress: product.seller?.shopAddress,
      user: {
        name: product.seller?.user?.name || '',
        username: product.seller?.user?.username || '',
      },
    };

    this.category = {
      id: product.category?.id,
      name: product.category?.name || '',
      description: product.category?.description,
    };
  }
}
