import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

// COD Payment DTOs
export class CreateCODPaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  orderInfo: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

// MoMo Payment DTOs
export class CreateMoMoPaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  orderInfo: string;

  @IsString()
  @IsOptional()
  extraData?: string;

  @IsEnum(['payWithATM', 'payWithCC', 'captureWallet'])
  @IsOptional()
  requestType?: 'payWithATM' | 'payWithCC' | 'captureWallet';

  @IsEnum(['vi', 'en'])
  @IsOptional()
  lang?: 'vi' | 'en';
}

// VNPay Payment DTOs
export class CreateVNPayPaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  orderInfo: string;

  @IsEnum(['vi', 'en'])
  @IsOptional()
  locale?: 'vi' | 'en';

  @IsString()
  @IsOptional()
  bankCode?: string;
}

// General Payment DTOs
export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  @Min(1000)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePaymentDto {
  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  momoRequestId?: string;

  @IsString()
  @IsOptional()
  momoTransId?: string;

  @IsNumber()
  @IsOptional()
  momoResultCode?: number;

  @IsString()
  @IsOptional()
  vnpTransactionNo?: string;

  @IsString()
  @IsOptional()
  bankCode?: string;

  @IsString()
  @IsOptional()
  gatewayResponse?: string;

  @IsString()
  @IsOptional()
  failureReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class PaymentResponseDto {
  id: number;
  orderId: number;
  userId: number;
  amount: number;
  method: PaymentMethod;
  status: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(payment: any) {
    this.id = payment.id;
    this.orderId = payment.orderId;
    this.userId = payment.userId;
    this.amount = parseFloat(payment.amount);
    this.method = payment.method;
    this.status = payment.status;
    this.transactionId = payment.transactionId;
    this.createdAt = payment.createdAt;
    this.updatedAt = payment.updatedAt;
  }
}
