import { IsNumber, IsString, IsOptional, IsArray, IsEnum, Min } from 'class-validator';
import { OrderStatus } from '../../shared/enums';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  items: CreateOrderItemDto[];
}

// ✅ Simplified CreateOrderItemDto - Remove price (calculated from product)
export class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  note?: string;
}

export class OrderResponseDto {
  id: number;
  buyerId: number;
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: number;
    user: {
      name: string;
      username: string;
      email: string;
      address?: string;
      phone?: string;
    };
  };
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl?: string;
      seller: {
        id: number;
        shopName?: string;
      };
    };
  }[];

  constructor(order: any) {
    this.id = order.id;
    this.buyerId = order.buyerId;
    this.totalPrice = order.totalPrice;
    this.status = order.status;
    this.note = order.note;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;

    this.buyer = {
      id: order.buyer.id,
      user: {
        name: order.buyer.user.name,
        username: order.buyer.user.username,
        email: order.buyer.user.email,
        address: order.buyer.user.address,
        phone: order.buyer.user.phone,
      },
    };

    this.items = order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: {
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        seller: {
          id: item.product.seller.id,
          shopName: item.product.seller.shopName,
        },
      },
    }));
  }
}
