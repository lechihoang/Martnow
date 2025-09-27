import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  ValidateNested,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../shared/enums';

// ========== CHECKOUT DTOs ==========

export class CartItemDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

export class CartCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsString()
  @IsOptional()
  note?: string;
}

// ========== RESPONSE DTOs ==========

export class OrderItemResponseDto {
  productId: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    seller: {
      id: string;
      user: {
        name: string;
      };
    };
  };
}

export class OrderResponseDto {
  id: number;
  totalPrice: number;
  status: OrderStatus;
  note?: string;
  sellerName: string;
  itemCount: number;
  items: OrderItemResponseDto[];
  createdAt: Date;
}

export class CheckoutResultDto {
  orders: OrderResponseDto[];
  totalAmount: number;
  paymentRequired: boolean;
  sellerCount: number;
  // Payment URLs for VNPay
  primaryPaymentUrl?: string; // Main payment URL for all orders
  paymentInfos?: {
    orderId: number;
    amount: number;
    paymentUrl: string;
  }[];
}
