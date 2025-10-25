import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager, UpdateResult } from 'typeorm';
import { PaymentService } from '../payment.service';
import { Order } from '../../order/entities/order.entity';
import { OrderItem } from '../../order/entities/order-item.entity';
import { Product } from '../../product/entities/product.entity';
import { Buyer } from '../../account/buyer/entities/buyer.entity';
import { User } from '../../account/user/entities/user.entity';
import { OrderStatus } from '../../shared/enums';
import { VnpayService } from 'nestjs-vnpay';
import { ReturnQueryFromVNPay } from 'vnpay';
import { UserRole } from '../../lib/supabase';

describe('PaymentService', () => {
  let service: PaymentService;
  let orderRepository: Repository<Order>;
  let vnpayService: VnpayService;

  // Test data
  let testOrder: Order;
  let testBuyer: Buyer;
  let testUser: User;
  let testProduct1: Product;
  let testProduct2: Product;
  let mockUpdateResult: UpdateResult;

  beforeEach(async () => {
    // Create mock update result
    mockUpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    // Create mock repositories and services
    const mockOrderRepository = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(mockUpdateResult),
      manager: {
        update: jest.fn().mockResolvedValue(mockUpdateResult),
      },
    };

    const mockVnpayService = {
      buildPaymentUrl: jest.fn(),
      verifyReturnUrl: jest.fn(),
      verifyIpnCall: jest.fn(),
      getBankList: jest.fn(),
      queryDr: jest.fn(),
      refund: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          VNPAY_TMN_CODE: 'TEST_TMN_CODE',
          VNPAY_SECURE_SECRET: 'TEST_SECRET',
          VNPAY_RETURN_URL: 'http://localhost:3002/payment/vnpay-return',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: VnpayService,
          useValue: mockVnpayService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    vnpayService = module.get<VnpayService>(VnpayService);

    // Setup test data
    setupTestData();
  });

  function setupTestData() {
    // Create user
    testUser = new User();
    testUser.id = 'user-uuid-123';
    testUser.email = 'buyer@test.com';
    testUser.name = 'Test Buyer';
    testUser.role = UserRole.BUYER;

    // Create buyer
    testBuyer = new Buyer();
    testBuyer.id = 'buyer-uuid-123';
    testBuyer.user = testUser;

    // Create products
    testProduct1 = new Product();
    testProduct1.id = 1;
    testProduct1.name = 'Product 1';
    testProduct1.price = 100;
    testProduct1.stock = 10;

    testProduct2 = new Product();
    testProduct2.id = 2;
    testProduct2.name = 'Product 2';
    testProduct2.price = 200;
    testProduct2.stock = 5;

    // Create order with items
    testOrder = new Order();
    testOrder.id = 1;
    testOrder.buyerId = testBuyer.id;
    testOrder.buyer = testBuyer;
    testOrder.status = OrderStatus.PENDING;
    testOrder.totalPrice = 500; // 100*2 + 200*1.5
    testOrder.note = 'Test order';
    testOrder.createdAt = new Date('2024-01-01');

    const item1 = new OrderItem();
    item1.orderId = testOrder.id;
    item1.productId = testProduct1.id;
    item1.product = testProduct1;
    item1.quantity = 2;
    item1.price = 100;

    const item2 = new OrderItem();
    item2.orderId = testOrder.id;
    item2.productId = testProduct2.id;
    item2.product = testProduct2;
    item2.quantity = 1;
    item2.price = 300;

    testOrder.items = [item1, item2];
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentUrl', () => {
    it('should create payment URL with correct order amount', async () => {
      // Arrange
      const mockPaymentUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=50000&...';

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);
      jest.spyOn(vnpayService, 'buildPaymentUrl').mockReturnValue(mockPaymentUrl);

      // Act
      const result = await service.createPaymentUrl(testOrder.id);

      // Assert
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: testOrder.id },
        relations: ['buyer', 'buyer.user', 'items', 'items.product'],
      });
      expect(vnpayService.buildPaymentUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          vnp_Amount: 500, // Should match order total
          vnp_OrderInfo: testOrder.note,
        })
      );
      expect(orderRepository.update).toHaveBeenCalledWith(
        testOrder.id,
        expect.objectContaining({
          paymentReference: expect.stringContaining('ORDER_1_'),
        })
      );
      expect(result).toBe(mockPaymentUrl);
    });

    it('should throw error when order not found', async () => {
      // Arrange
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.createPaymentUrl(999)).rejects.toThrow('Order not found');
    });

    it('should use custom amount when provided', async () => {
      // Arrange
      const customAmount = 1000;
      const mockPaymentUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);
      jest.spyOn(vnpayService, 'buildPaymentUrl').mockReturnValue(mockPaymentUrl);

      // Act
      await service.createPaymentUrl(testOrder.id, customAmount);

      // Assert
      expect(vnpayService.buildPaymentUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          vnp_Amount: customAmount,
        })
      );
    });

    it('should use entity manager when provided', async () => {
      // Arrange
      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(testOrder),
        }),
        update: jest.fn().mockResolvedValue(mockUpdateResult),
      } as unknown as EntityManager;

      const mockPaymentUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
      jest.spyOn(vnpayService, 'buildPaymentUrl').mockReturnValue(mockPaymentUrl);

      // Act
      await service.createPaymentUrl(testOrder.id, undefined, mockManager);

      // Assert
      expect(mockManager.getRepository).toHaveBeenCalledWith(Order);
      expect(mockManager.update).toHaveBeenCalledWith(
        Order,
        testOrder.id,
        expect.objectContaining({
          paymentReference: expect.stringContaining('ORDER_1_'),
        })
      );
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment and update order status to PAID', async () => {
      // Arrange
      const txnRef = 'ORDER_1_1234567890';
      testOrder.paymentReference = txnRef;

      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: txnRef,
        vnp_Amount: '50000',
        vnp_ResponseCode: '00',
      } as ReturnQueryFromVNPay;

      const mockVerifyResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Payment verified',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: 'Test order',
      } as any;

      jest.spyOn(vnpayService, 'verifyReturnUrl').mockResolvedValue(mockVerifyResult);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);

      // Act
      const result = await service.verifyPayment(mockQuery);

      // Assert
      expect(vnpayService.verifyReturnUrl).toHaveBeenCalledWith(mockQuery);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { paymentReference: txnRef },
        relations: ['items', 'items.product'],
      });
      expect(orderRepository.update).toHaveBeenCalledWith(
        testOrder.id,
        expect.objectContaining({
          status: OrderStatus.PAID,
          paidAt: expect.any(Date),
        })
      );
      expect(result).toEqual(mockVerifyResult);
    });

    it('should reduce product stock after successful payment', async () => {
      // Arrange
      const txnRef = 'ORDER_1_1234567890';
      testOrder.paymentReference = txnRef;

      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: txnRef,
        vnp_ResponseCode: '00',
      } as ReturnQueryFromVNPay;

      const mockVerifyResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Verified',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyReturnUrl').mockResolvedValue(mockVerifyResult);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);

      // Act
      await service.verifyPayment(mockQuery);

      // Assert - Product 1: stock 10 - quantity 2 = 8
      expect(orderRepository.manager.update).toHaveBeenCalledWith(
        'product',
        { id: testProduct1.id },
        { stock: 8 }
      );
      // Product 2: stock 5 - quantity 1 = 4
      expect(orderRepository.manager.update).toHaveBeenCalledWith(
        'product',
        { id: testProduct2.id },
        { stock: 4 }
      );
    });

    it('should handle payment verification failure gracefully', async () => {
      // Arrange
      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: 'ORDER_1_FAILED',
        vnp_ResponseCode: '99',
      } as ReturnQueryFromVNPay;

      const mockVerifyResult = {
        isSuccess: false,
        isVerified: false,
        message: 'Payment failed',
        vnp_TxnRef: 'ORDER_1_FAILED',
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyReturnUrl').mockResolvedValue(mockVerifyResult);

      // Act
      const result = await service.verifyPayment(mockQuery);

      // Assert
      expect(result).toEqual(mockVerifyResult);
      expect(orderRepository.findOne).not.toHaveBeenCalled();
    });

    it('should handle order not found after successful verification', async () => {
      // Arrange
      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: 'NONEXISTENT_ORDER',
        vnp_ResponseCode: '00',
      } as ReturnQueryFromVNPay;

      const mockVerifyResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Verified',
        vnp_TxnRef: 'NONEXISTENT_ORDER',
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyReturnUrl').mockResolvedValue(mockVerifyResult);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.verifyPayment(mockQuery);

      // Assert
      expect(result).toEqual(mockVerifyResult);
    });
  });

  describe('handleIPN', () => {
    it('should handle IPN and update order status to PAID', async () => {
      // Arrange
      const txnRef = 'ORDER_1_1234567890';
      testOrder.paymentReference = txnRef;
      testOrder.status = OrderStatus.PENDING;

      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: txnRef,
        vnp_ResponseCode: '00',
      } as ReturnQueryFromVNPay;

      const mockIpnResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Success',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyIpnCall').mockResolvedValue(mockIpnResult);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);

      // Act
      const result = await service.handleIPN(mockQuery);

      // Assert
      expect(vnpayService.verifyIpnCall).toHaveBeenCalledWith(mockQuery);
      expect(orderRepository.update).toHaveBeenCalledWith(
        testOrder.id,
        expect.objectContaining({
          status: OrderStatus.PAID,
          paidAt: expect.any(Date),
        })
      );
      expect(result).toEqual(mockIpnResult);
    });

    it('should not update order if already PAID', async () => {
      // Arrange
      const txnRef = 'ORDER_1_1234567890';
      testOrder.paymentReference = txnRef;
      testOrder.status = OrderStatus.PAID; // Already paid

      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: txnRef,
        vnp_ResponseCode: '00',
      } as ReturnQueryFromVNPay;

      const mockIpnResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Success',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyIpnCall').mockResolvedValue(mockIpnResult);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);
      const updateSpy = jest.spyOn(orderRepository, 'update');
      const managerUpdateSpy = jest.spyOn(orderRepository.manager, 'update');

      // Act
      const result = await service.handleIPN(mockQuery);

      // Assert
      expect(updateSpy).not.toHaveBeenCalled();
      expect(managerUpdateSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockIpnResult);
    });

    it('should reduce product stock when processing IPN', async () => {
      // Arrange
      const txnRef = 'ORDER_1_1234567890';
      testOrder.paymentReference = txnRef;
      testOrder.status = OrderStatus.PENDING;

      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: txnRef,
        vnp_ResponseCode: '00',
      } as ReturnQueryFromVNPay;

      const mockIpnResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Success',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyIpnCall').mockResolvedValue(mockIpnResult);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);

      // Act
      await service.handleIPN(mockQuery);

      // Assert
      expect(orderRepository.manager.update).toHaveBeenCalledTimes(2);
      expect(orderRepository.manager.update).toHaveBeenCalledWith(
        'product',
        { id: testProduct1.id },
        { stock: 8 } // 10 - 2
      );
      expect(orderRepository.manager.update).toHaveBeenCalledWith(
        'product',
        { id: testProduct2.id },
        { stock: 4 } // 5 - 1
      );
    });

    it('should handle IPN verification failure', async () => {
      // Arrange
      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: 'ORDER_1_FAILED',
        vnp_ResponseCode: '99',
      } as ReturnQueryFromVNPay;

      const mockIpnResult = {
        isSuccess: false,
        isVerified: false,
        message: 'Failed',
        vnp_TxnRef: 'ORDER_1_FAILED',
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyIpnCall').mockResolvedValue(mockIpnResult);

      // Act
      const result = await service.handleIPN(mockQuery);

      // Assert
      expect(result).toEqual(mockIpnResult);
      expect(orderRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getBankList', () => {
    it('should return bank list from VNPay service', async () => {
      // Arrange
      const mockBankList = [
        { bank_code: 'NCB', bank_name: 'Ngân hàng NCB', logo_link: 'http://example.com/ncb.png', bank_type: '1', display_order: 1 },
        { bank_code: 'VCB', bank_name: 'Ngân hàng Vietcombank', logo_link: 'http://example.com/vcb.png', bank_type: '1', display_order: 2 },
      ] as any;
      jest.spyOn(vnpayService, 'getBankList').mockResolvedValue(mockBankList);

      // Act
      const result = await service.getBankList();

      // Assert
      expect(vnpayService.getBankList).toHaveBeenCalled();
      expect(result).toEqual(mockBankList);
    });
  });

  describe('queryPayment', () => {
    it('should query payment status from VNPay', async () => {
      // Arrange
      const txnRef = 'ORDER_1_1234567890';
      const txnDate = '20240101120000';
      const mockQueryResult = {
        vnp_ResponseCode: '00',
        vnp_Message: 'Success',
        vnp_TxnRef: txnRef,
        vnp_Amount: 50000,
      } as any;

      jest.spyOn(vnpayService, 'queryDr').mockResolvedValue(mockQueryResult);

      // Act
      const result = await service.queryPayment(txnRef, txnDate);

      // Assert
      expect(vnpayService.queryDr).toHaveBeenCalledWith(
        expect.objectContaining({
          vnp_TxnRef: txnRef,
          vnp_TransactionDate: parseInt(txnDate),
        })
      );
      expect(result).toEqual(mockQueryResult);
    });
  });

  describe('refundPayment', () => {
    it('should process refund through VNPay', async () => {
      // Arrange
      const txnRef = 'ORDER_1_1234567890';
      const amount = 50000;
      const refundReason = 'Customer request';
      const mockRefundResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Refund successful',
        vnp_ResponseCode: '00',
      } as any;

      jest.spyOn(vnpayService, 'refund').mockResolvedValue(mockRefundResult);

      // Act
      const result = await service.refundPayment(txnRef, amount, refundReason);

      // Assert
      expect(vnpayService.refund).toHaveBeenCalledWith(
        expect.objectContaining({
          vnp_Amount: amount,
          vnp_OrderInfo: refundReason,
          vnp_TransactionType: '02',
        })
      );
      expect(result).toEqual(mockRefundResult);
    });
  });

  describe('edge cases', () => {
    it('should handle products with insufficient stock', async () => {
      // Arrange
      testProduct1.stock = 1; // Not enough for quantity 2
      const txnRef = 'ORDER_1_1234567890';
      testOrder.paymentReference = txnRef;

      const mockQuery: ReturnQueryFromVNPay = {
        vnp_TxnRef: txnRef,
        vnp_ResponseCode: '00',
      } as ReturnQueryFromVNPay;

      const mockVerifyResult = {
        isSuccess: true,
        isVerified: true,
        message: 'Verified',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: 'Test',
      } as any;

      jest.spyOn(vnpayService, 'verifyReturnUrl').mockResolvedValue(mockVerifyResult);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);

      // Act
      await service.verifyPayment(mockQuery);

      // Assert - Should still update even if stock goes negative
      expect(orderRepository.manager.update).toHaveBeenCalledWith(
        'product',
        { id: testProduct1.id },
        { stock: -1 } // 1 - 2 = -1
      );
    });

    it('should handle order with empty items array', async () => {
      // Arrange
      testOrder.items = [];
      const mockPaymentUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(testOrder);
      jest.spyOn(vnpayService, 'buildPaymentUrl').mockReturnValue(mockPaymentUrl);

      // Act
      const result = await service.createPaymentUrl(testOrder.id);

      // Assert
      expect(vnpayService.buildPaymentUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          vnp_Amount: 500, // Should use order.totalPrice
        })
      );
      expect(result).toBe(mockPaymentUrl);
    });
  });
});
