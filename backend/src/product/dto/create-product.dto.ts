import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsPositive, Min, Max } from 'class-validator';


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

// ✅ Simplified ProductResponseDto
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
  
  // Relations
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
  
  // Optional aggregated data
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;

  constructor(product: any) {
    // Basic fields
    this.id = product.id;
    this.sellerId = product.sellerId;
    this.categoryId = product.categoryId;
    this.name = product.name;
    this.description = product.description;
    this.price = Number(product.price);
    this.isAvailable = product.isAvailable;
    this.stock = product.stock;
    this.discount = product.discount;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
    
    // No image URL support
    this.imageUrl = undefined;
    
    // Relations
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
    
    // Optional aggregated data
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
