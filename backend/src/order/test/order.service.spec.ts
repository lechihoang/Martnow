import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderService } from '../order.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Buyer } from '../../account/buyer/entities/buyer.entity';
import { Product } from '../../product/entities/product.entity';
import { Seller } from '../../account/seller/entities/seller.entity';
import { User } from '../../account/user/entities/user.entity';
import { OrderStatus } from '../../shared/enums';
import { PaymentService } from '../../payment/payment.service';
import { UserRole } from '../../lib/supabase';

describe('OrderService - Multi-Seller Orders', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let productRepository: Repository<Product>;
  let buyerRepository: Repository<Buyer>;
  let dataSource: DataSource;

  // Test data
  let seller1: Seller;
  let seller2: Seller;
  let buyer: Buyer;
  let product1: Product;
  let product2: Product;
  let product3: Product;
  let order: Order;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Buyer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            createPaymentUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(
      getRepositoryToken(Order),
    );
    orderItemRepository = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    buyerRepository = module.get<Repository<Buyer>>(
      getRepositoryToken(Buyer),
    );
    dataSource = module.get<DataSource>(DataSource);

    // Setup test data
    setupTestData();
  });

  function setupTestData() {
    // Create seller 1 with user
    const user1 = new User();
    user1.id = 'seller-user-1';
    user1.email = 'seller1@example.com';
    user1.name = 'Seller One';
    user1.username = 'seller1';
    user1.role = UserRole.SELLER;

    seller1 = new Seller();
    seller1.id = 'seller-1';
    seller1.shopName = 'Shop One';
    seller1.shopAddress = '123 Street A';
    seller1.user = user1;

    // Create seller 2 with user
    const user2 = new User();
    user2.id = 'seller-user-2';
    user2.email = 'seller2@example.com';
    user2.name = 'Seller Two';
    user2.username = 'seller2';
    user2.role = UserRole.SELLER;

    seller2 = new Seller();
    seller2.id = 'seller-2';
    seller2.shopName = 'Shop Two';
    seller2.shopAddress = '456 Street B';
    seller2.user = user2;

    // Create buyer with user
    const buyerUser = new User();
    buyerUser.id = 'buyer-user-1';
    buyerUser.email = 'buyer@example.com';
    buyerUser.name = 'Test Buyer';
    buyerUser.username = 'buyer1';
    buyerUser.role = UserRole.BUYER;

    buyer = new Buyer();
    buyer.id = 'buyer-1';
    buyer.user = buyerUser;

    // Create products for seller 1
    product1 = new Product();
    product1.id = 1;
    product1.name = 'Product 1 from Seller 1';
    product1.price = 100;
    product1.sellerId = seller1.id;
    product1.seller = seller1;
    product1.stock = 10;

    product2 = new Product();
    product2.id = 2;
    product2.name = 'Product 2 from Seller 1';
    product2.price = 200;
    product2.sellerId = seller1.id;
    product2.seller = seller1;
    product2.stock = 10;

    // Create product for seller 2
    product3 = new Product();
    product3.id = 3;
    product3.name = 'Product 3 from Seller 2';
    product3.price = 300;
    product3.sellerId = seller2.id;
    product3.seller = seller2;
    product3.stock = 10;

    // Create order with items from both sellers
    order = new Order();
    order.id = 1;
    order.buyerId = buyer.id;
    order.buyer = buyer;
    order.status = OrderStatus.PAID;
    order.totalPrice = 600; // 100 + 200 + 300
    order.createdAt = new Date('2024-01-01');
    order.paidAt = new Date('2024-01-01T10:00:00');

    // Create order items
    const item1 = new OrderItem();
    item1.orderId = order.id;
    item1.productId = product1.id;
    item1.product = product1;
    item1.quantity = 1;
    item1.price = 100;

    const item2 = new OrderItem();
    item2.orderId = order.id;
    item2.productId = product2.id;
    item2.product = product2;
    item2.quantity = 1;
    item2.price = 200;

    const item3 = new OrderItem();
    item3.orderId = order.id;
    item3.productId = product3.id;
    item3.product = product3;
    item3.quantity = 1;
    item3.price = 300;

    order.items = [item1, item2, item3];
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrdersBySeller', () => {
    it('should return only items belonging to seller 1 when queried by seller 1', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([order]);

      // Act
      const result = await service.getOrdersBySeller(seller1.id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(order.id);
      expect(result[0].items).toHaveLength(2); // Only product1 and product2
      expect(result[0].items[0].productName).toBe('Product 1 from Seller 1');
      expect(result[0].items[1].productName).toBe('Product 2 from Seller 1');
      expect(result[0].sellerTotal).toBe(300); // 100 + 200

      // Verify query builder was called with correct seller ID
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.sellerId = :sellerId',
        { sellerId: seller1.id },
      );
    });

    it('should return only items belonging to seller 2 when queried by seller 2', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([order]);

      // Act
      const result = await service.getOrdersBySeller(seller2.id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(order.id);
      expect(result[0].items).toHaveLength(1); // Only product3
      expect(result[0].items[0].productName).toBe('Product 3 from Seller 2');
      expect(result[0].sellerTotal).toBe(300); // Only product3 price

      // Verify query builder was called with correct seller ID
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.sellerId = :sellerId',
        { sellerId: seller2.id },
      );
    });

    it('should only return PAID orders', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([order]);

      // Act
      await service.getOrdersBySeller(seller1.id);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status: OrderStatus.PAID },
      );
    });

    it('should include buyer information in the response', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([order]);

      // Act
      const result = await service.getOrdersBySeller(seller1.id);

      // Assert
      expect(result[0].buyerName).toBe('Test Buyer');
      expect(result[0].buyerEmail).toBe('buyer@example.com');
    });

    it('should calculate correct seller total for items', async () => {
      // Arrange
      const item1 = order.items[0]; // Product 1: price 100, qty 1
      const item2 = order.items[1]; // Product 2: price 200, qty 1

      // Change quantity to test calculation
      item1.quantity = 2;
      item2.quantity = 3;

      mockQueryBuilder.getMany.mockResolvedValue([order]);

      // Act
      const result = await service.getOrdersBySeller(seller1.id);

      // Assert
      // Seller 1: (100 * 2) + (200 * 3) = 200 + 600 = 800
      expect(result[0].sellerTotal).toBe(800);
      expect(result[0].items[0].total).toBe(200); // 100 * 2
      expect(result[0].items[1].total).toBe(600); // 200 * 3
    });

    it('should return empty array when seller has no orders', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      const result = await service.getOrdersBySeller('non-existent-seller');

      // Assert
      expect(result).toEqual([]);
    });

    it('should order results by creation date in descending order', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([order]);

      // Act
      await service.getOrdersBySeller(seller1.id);

      // Assert
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'order.createdAt',
        'DESC',
      );
    });
  });
});
