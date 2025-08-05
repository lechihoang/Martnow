import { IsNumber, IsOptional } from 'class-validator';

export class CreateBuyerDto {
  @IsNumber()
  userId: number;
}

export class BuyerResponseDto {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  totalOrders: number;
  totalReviews: number;

  constructor(buyer: any) {
    this.id = buyer.id;
    this.userId = buyer.userId;
    this.createdAt = buyer.createdAt;
    this.updatedAt = buyer.updatedAt;
    this.user = {
      id: buyer.user.id,
      name: buyer.user.name,
      username: buyer.user.username,
      email: buyer.user.email,
      avatar: buyer.user.avatar,
    };
    this.totalOrders = buyer.orders?.length || 0;
    this.totalReviews = buyer.reviews?.length || 0;
  }
}
