import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from './entities/category.entity';
import { Seller } from '../user/entities/seller.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductFilterOptions {
  categoryId?: number;
  sellerId?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class ProductService {
  private readonly productRelations = ['category', 'seller', 'seller.user', 'images'];

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Tách images khỏi DTO để tạo Product trước
    const { images, ...productData } = createProductDto;
    
    // Đảm bảo có category và seller tồn tại
    await this.ensureDefaultDataExists();
    
    // Tạo product chỉ với các trường cần thiết
    const product = this.productRepository.create({
      ...productData,
      sellerId: createProductDto.sellerId,
      categoryId: createProductDto.categoryId,
    });
    
    const savedProduct = await this.productRepository.save(product);
    
    // Tạo ProductImage nếu có images
    if (images && images.length > 0) {
      const productImages = images.map((imageInfo, index) => {
        return this.productImageRepository.create({
          productId: savedProduct.id,
          imageData: imageInfo.imageData,
          mimeType: imageInfo.mimeType,
          originalName: imageInfo.originalName,
          fileSize: imageInfo.fileSize,
          displayOrder: index,
          isPrimary: index === 0, // Ảnh đầu tiên là ảnh chính
        });
      });
      
      await this.productImageRepository.save(productImages);
    }
    
    // Load và trả về product với đầy đủ relations
    const result = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: this.productRelations,
    });
    
    if (!result) {
      throw new NotFoundException(`Product with ID ${savedProduct.id} not found after creation`);
    }
    
    return result;
  }

  private async ensureDefaultDataExists(): Promise<void> {
    // Tạo category mặc định nếu chưa có
    let defaultCategory = await this.categoryRepository.findOne({ where: { id: 1 } });
    if (!defaultCategory) {
      defaultCategory = this.categoryRepository.create({
        id: 1,
        name: 'Món ăn',
        description: 'Danh mục món ăn mặc định',
      });
      await this.categoryRepository.save(defaultCategory);
    }

    // Tạo seller mặc định nếu chưa có
    let defaultSeller = await this.sellerRepository.findOne({ where: { id: 1 } });
    if (!defaultSeller) {
      // Tạo seller mặc định sẽ cần user mặc định trước
      // Tạm thời bỏ qua, sẽ xử lý sau
      console.log('Default seller not found, but continuing...');
    }
  }  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: this.productRelations,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id); // Kiểm tra product có tồn tại không
    
    // Tách images khỏi DTO để update Product trước
    const { images, ...productData } = updateProductDto;
    
    await this.productRepository.update(id, productData);
    
    // Cập nhật images nếu có
    if (images !== undefined) {
      // Xóa các ảnh cũ
      await this.productImageRepository.delete({ productId: id });
      
      // Thêm ảnh mới
      if (images.length > 0) {
        const productImages = images.map((imageInfo, index) => {
          return this.productImageRepository.create({
            productId: id,
            imageData: imageInfo.imageData,
            mimeType: imageInfo.mimeType,
            originalName: imageInfo.originalName,
            fileSize: imageInfo.fileSize,
            displayOrder: index,
            isPrimary: index === 0,
          });
        });
        
        await this.productImageRepository.save(productImages);
      }
    }
    
    return this.findOne(id);
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    await this.findOne(id); // Kiểm tra product có tồn tại không
    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  async findAll(filters: ProductFilterOptions = {}): Promise<Product[]> {
    const { categoryId, type, minPrice, maxPrice } = filters;
    
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .leftJoinAndSelect('product.images', 'images');

    this.applyFilters(query, { categoryId, type, minPrice, maxPrice });

    return query.getMany();
  }

  async findTopDiscountProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.discount', 'DESC')
      .take(limit)
      .getMany();
  }

  // Kiểm tra xem product có thuộc về seller không
  async validateSellerOwnership(productId: number, sellerId: number): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId, sellerId },
    });
    return !!product;
  }

  // Lấy tất cả products của một seller
  async findProductsBySeller(sellerId: number, withRelations: boolean = false): Promise<Product[]> {
    if (withRelations) {
      return this.productRepository.createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.seller', 'seller')
        .leftJoinAndSelect('seller.user', 'user')
        .leftJoinAndSelect('product.images', 'images')
        .where('product.sellerId = :sellerId', { sellerId })
        .getMany();
    }

    return this.productRepository.find({
      where: { sellerId },
    });
  }

  private applyFilters(query: any, filters: ProductFilterOptions): void {
    const { categoryId, sellerId, type, minPrice, maxPrice } = filters;

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (sellerId) {
      query.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    if (type) {
      query.andWhere('product.type = :type', { type });
    }

    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }
  }
}
