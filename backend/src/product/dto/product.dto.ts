import { IsString, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  sellerId: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;
}

export class ProductResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    shopName?: string;
  };

  constructor(product: any) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.stock = product.stock;
    this.image = product.image;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
    
    if (product.category) {
      this.category = {
        id: product.category.id,
        name: product.category.name,
      };
    }
    
    if (product.seller) {
      this.seller = {
        id: product.seller.id,
        shopName: product.seller.shopName,
      };
    }
  }
}
