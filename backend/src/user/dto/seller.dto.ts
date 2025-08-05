import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateSellerDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  shopAddress?: string;

  @IsString()
  @IsOptional()
  shopPhone?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSellerDto {
  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  shopAddress?: string;

  @IsString()
  @IsOptional()
  shopPhone?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class SellerResponseDto {
  id: number;
  userId: number;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  totalProducts: number;
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  };

  constructor(seller: any) {
    this.id = seller.id;
    this.userId = seller.userId;
    this.shopName = seller.shopName;
    this.shopAddress = seller.shopAddress;
    this.shopPhone = seller.shopPhone;
    this.description = seller.description;
    this.createdAt = seller.createdAt;
    this.updatedAt = seller.updatedAt;
    this.user = {
      id: seller.user.id,
      name: seller.user.name,
      username: seller.user.username,
      email: seller.user.email,
      avatar: seller.user.avatar,
    };
    this.totalProducts = seller.products?.length || 0;

    if (seller.stats) {
      this.stats = {
        totalOrders: seller.stats.totalOrders,
        totalRevenue: seller.stats.totalRevenue,
        averageRating: seller.stats.averageRating,
        completionRate: seller.stats.totalOrders > 0 
          ? Number(((seller.stats.completedOrders / seller.stats.totalOrders) * 100).toFixed(2))
          : 0,
      };
    }
  }
}
