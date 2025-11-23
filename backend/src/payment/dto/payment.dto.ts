import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  ipAddr?: string;

  @IsString()
  @IsOptional()
  locale?: string; // 'vn' hoặc 'en'

  @IsString()
  @IsOptional()
  bankCode?: string; // Mã ngân hàng nếu muốn chuyển thẳng
}

export class PaymentResponseDto {
  paymentUrl: string;
  txnRef: string;
  amount: number;
  orderId: number;
}

export class PaymentCallbackDto {
  @IsString()
  @IsNotEmpty()
  vnp_Amount: string;

  @IsString()
  @IsOptional()
  vnp_BankCode?: string;

  @IsString()
  @IsOptional()
  vnp_BankTranNo?: string;

  @IsString()
  @IsOptional()
  vnp_CardType?: string;

  @IsString()
  @IsNotEmpty()
  vnp_OrderInfo: string;

  @IsString()
  @IsOptional()
  vnp_PayDate?: string;

  @IsString()
  @IsNotEmpty()
  vnp_ResponseCode: string;

  @IsString()
  @IsNotEmpty()
  vnp_TmnCode: string;

  @IsString()
  @IsOptional()
  vnp_TransactionNo?: string;

  @IsString()
  @IsOptional()
  vnp_TransactionStatus?: string;

  @IsString()
  @IsNotEmpty()
  vnp_TxnRef: string;

  @IsString()
  @IsNotEmpty()
  vnp_SecureHash: string;
}
