import { IsOptional, IsString } from 'class-validator';

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
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate?: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}
