import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  extraData?: string;
  requestType?: 'payWithATM' | 'payWithCC' | 'captureWallet';
  lang?: 'vi' | 'en';
}

export interface MoMoPaymentResponse {
  success: boolean;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  requestId?: string;
  message?: string;
}

export interface MoMoIPNData {
  partnerCode: string;
  accessKey: string;
  requestId: string;
  amount: number;
  orderId: string;
  orderInfo: string;
  orderType: string;
  transId: string;
  message: string;
  localMessage: string;
  responseTime: string;
  errorCode: number;
  payType: string;
  extraData: string;
  signature: string;
  resultCode: number;
}

@Injectable()
export class MoMoService {
  private readonly logger = new Logger(MoMoService.name);

  constructor(private configService: ConfigService) {}

  private get config() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    return {
      partnerCode: this.configService.get('MOMO_PARTNER_CODE') || 'MOMOBKUN20180529',
      accessKey: this.configService.get('MOMO_ACCESS_KEY') || 'klm05TvNBzhg7h7j',
      secretKey: this.configService.get('MOMO_SECRET_KEY') || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
      endpoint: isProduction 
        ? 'https://payment.momo.vn/v2/gateway/api/create'
        : 'https://test-payment.momo.vn/v2/gateway/api/create',
      returnUrl: this.configService.get('MOMO_RETURN_URL') || 'http://localhost:3000/payment/momo/return',
      notifyUrl: this.configService.get('MOMO_NOTIFY_URL') || 'http://localhost:3001/api/payment/momo/notify',
      isProduction
    };
  }

  /**
   * Tạo payment request đến MoMo
   * Documentation: https://developers.momo.vn/v3/#/docs/payment/api/wallet/onetime
   */
  async createPayment(orderData: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
    try {
      const config = this.config;
      const requestId = `${orderData.orderId}_${Date.now()}`;
      
      // MoMo required parameters
      const rawData = [
        `accessKey=${config.accessKey}`,
        `amount=${orderData.amount}`,
        `extraData=${orderData.extraData || ''}`,
        `ipnUrl=${config.notifyUrl}`,
        `orderId=${orderData.orderId}`,
        `orderInfo=${orderData.orderInfo}`,
        `partnerCode=${config.partnerCode}`,
        `redirectUrl=${config.returnUrl}`,
        `requestId=${requestId}`,
        `requestType=${orderData.requestType || 'captureWallet'}`
      ].join('&');

      // Create signature
      const signature = crypto
        .createHmac('sha256', config.secretKey)
        .update(rawData)
        .digest('hex');

      const requestBody = {
        partnerCode: config.partnerCode,
        accessKey: config.accessKey,
        requestId: requestId,
        amount: orderData.amount,
        orderId: orderData.orderId,
        orderInfo: orderData.orderInfo,
        redirectUrl: config.returnUrl,
        ipnUrl: config.notifyUrl,
        extraData: orderData.extraData || '',
        requestType: orderData.requestType || 'captureWallet',
        signature: signature,
        lang: orderData.lang || 'vi'
      };

      this.logger.log(`Creating MoMo payment for order: ${orderData.orderId}`);
      this.logger.debug(`MoMo request body: ${JSON.stringify(requestBody)}`);

      const response = await axios.post(config.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      this.logger.debug(`MoMo response: ${JSON.stringify(response.data)}`);

      if (response.data.resultCode === 0) {
        this.logger.log(`MoMo payment URL created for order: ${orderData.orderId}`);
        return {
          success: true,
          payUrl: response.data.payUrl,
          deeplink: response.data.deeplink,
          qrCodeUrl: response.data.qrCodeUrl,
          requestId: requestId
        };
      } else {
        this.logger.error(`MoMo payment creation failed: ${response.data.message}`);
        return {
          success: false,
          message: `MoMo Error: ${response.data.message}`
        };
      }

    } catch (error) {
      this.logger.error(`MoMo payment creation failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to create MoMo payment'
      };
    }
  }

  /**
   * Xác thực IPN từ MoMo
   * Documentation: https://developers.momo.vn/v3/#/docs/payment/api/wallet/ipn
   */
  async verifyIPN(ipnData: MoMoIPNData): Promise<{
    isValid: boolean;
    orderId?: string;
    amount?: number;
    resultCode?: number;
    message?: string;
  }> {
    try {
      const config = this.config;
      
      // Rebuild raw signature data (theo thứ tự alphabet)
      const rawData = [
        `accessKey=${config.accessKey}`,
        `amount=${ipnData.amount}`,
        `extraData=${ipnData.extraData || ''}`,
        `message=${ipnData.message}`,
        `orderId=${ipnData.orderId}`,
        `orderInfo=${ipnData.orderInfo}`,
        `orderType=${ipnData.orderType}`,
        `partnerCode=${ipnData.partnerCode}`,
        `payType=${ipnData.payType}`,
        `requestId=${ipnData.requestId}`,
        `responseTime=${ipnData.responseTime}`,
        `resultCode=${ipnData.resultCode}`,
        `transId=${ipnData.transId}`
      ].join('&');

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', config.secretKey)
        .update(rawData)
        .digest('hex');

      const isValid = expectedSignature === ipnData.signature;

      if (!isValid) {
        this.logger.warn(`Invalid MoMo IPN signature for order: ${ipnData.orderId}`);
        this.logger.debug(`Expected: ${expectedSignature}, Got: ${ipnData.signature}`);
        return { isValid: false, message: 'Invalid signature' };
      }

      const result = {
        isValid: true,
        orderId: ipnData.orderId,
        amount: ipnData.amount,
        resultCode: ipnData.resultCode,
        message: this.getResultMessage(ipnData.resultCode)
      };

      this.logger.log(`MoMo IPN verified for order: ${result.orderId}, result: ${result.resultCode}`);
      return result;

    } catch (error) {
      this.logger.error(`MoMo IPN verification failed: ${error.message}`, error.stack);
      return { isValid: false, message: 'Verification failed' };
    }
  }

  /**
   * Query transaction status
   * Documentation: https://developers.momo.vn/v3/#/docs/payment/api/wallet/query
   */
  async queryTransactionStatus(orderId: string, requestId: string) {
    try {
      const config = this.config;
      
      const rawData = [
        `accessKey=${config.accessKey}`,
        `orderId=${orderId}`,
        `partnerCode=${config.partnerCode}`,
        `requestId=${requestId}`
      ].join('&');

      const signature = crypto
        .createHmac('sha256', config.secretKey)
        .update(rawData)
        .digest('hex');

      const requestBody = {
        partnerCode: config.partnerCode,
        accessKey: config.accessKey,
        requestId: requestId,
        orderId: orderId,
        signature: signature,
        lang: 'vi'
      };

      const queryEndpoint = config.isProduction 
        ? 'https://payment.momo.vn/v2/gateway/api/query'
        : 'https://test-payment.momo.vn/v2/gateway/api/query';

      const response = await axios.post(queryEndpoint, requestBody);
      
      return response.data;

    } catch (error) {
      this.logger.error(`MoMo query failed: ${error.message}`, error.stack);
      throw new Error('Failed to query MoMo transaction');
    }
  }

  /**
   * MoMo Result Codes
   */
  getResultMessage(resultCode: number): string {
    const messages: { [key: number]: string } = {
      0: 'Giao dịch thành công',
      9000: 'Giao dịch được cấp quyền (authorization) thành công',
      8000: 'Giao dịch đang được xử lý',
      7000: 'Trừ tiền thành công. Giao dịch bị nghi ngờ (fraud)',
      1000: 'Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán',
      4001: 'Giao dịch bị từ chối bởi người dùng',
      4100: 'Giao dịch thất bại do tài khoản người dùng không đủ tiền',
      5000: 'Giao dịch bị từ chối bởi nhà phát hành thẻ',
      6002: 'Giao dịch thất bại do lỗi thanh toán',
      7002: 'Giao dịch thất bại do thẻ/tài khoản bị khóa',
      49: 'RetryPayment: Giao dịch thất bại do lỗi kết nối/timeout/system',
      99: 'Người dùng từ chối xác nhận thanh toán'
    };

    return messages[resultCode] || 'Lỗi không xác định';
  }
}
