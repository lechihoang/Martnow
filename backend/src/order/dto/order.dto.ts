import { IsNumber, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { OrderStatus } from '../../common/enums';

export class CreateOrderDto {
  @IsNumber()
  buyerId: number;

  @IsNumber()
  @IsOptional()
  addressId?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  items: CreateOrderItemDto[];
}

export class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
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
  addressId?: number;
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
    };
  };
  address?: {
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    phone: string;
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
    this.addressId = order.addressId;
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
      },
    };

    if (order.address) {
      this.address = {
        addressLine: order.address.addressLine,
        city: order.address.city,
        district: order.address.district,
        ward: order.address.ward,
        phone: order.address.phone,
      };
    }

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
