import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService, IFile } from 'nestjs-cloudinary';
import { User } from '../account/user/entities/user.entity';
import { Product } from '../product/entities/product.entity';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Upload avatar cho user
   */
  async uploadAvatar(userId: string, file: IFile): Promise<string> {
    // Upload to Cloudinary
    const result = (await this.cloudinaryService.uploadFile(file, {
      folder: `foodee/users/${userId}/avatar`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    })) as CloudinaryUploadResult;

    // Update user avatar
    await this.userRepository.update(
      { id: userId },
      { avatar: result.secure_url },
    );

    return result.secure_url;
  }

  /**
   * Upload images cho product
   */
  async uploadProductImages(
    productId: string,
    files: IFile[],
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const result = (await this.cloudinaryService.uploadFile(file, {
        folder: `foodee/products/${productId}`,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      })) as CloudinaryUploadResult;
      return result.secure_url;
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await this.cloudinaryService.cloudinaryInstance.uploader.destroy(
        publicId,
        { resource_type: 'auto' },
      );
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }
  }

  /**
   * Upload general file (for blogs, etc.)
   */
  async uploadFile(
    file: IFile,
    type: string = 'general',
  ): Promise<{ secureUrl: string }> {
    const result = (await this.cloudinaryService.uploadFile(file, {
      folder: `foodee/${type}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    })) as CloudinaryUploadResult;

    return { secureUrl: result.secure_url };
  }

  /**
   * Verify product ownership - ensure seller owns the product
   */
  async verifyProductOwnership(
    productId: string,
    userId: string,
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: parseInt(productId) },
      relations: ['seller', 'seller.user'],
    });

    if (!product) {
      throw new ForbiddenException('Product not found');
    }

    if (product.seller.user.id !== userId) {
      throw new ForbiddenException('You do not own this product');
    }
  }

  /**
   * Delete all media files for a specific entity
   */
  deleteAllMediaFiles(_entityType: string, _entityId: string): void {
    // For now, just log the deletion request
    // In a real implementation, you would query the database for all media files
    // associated with this entity and delete them from Cloudinary
    console.log(`Deleting all media files for ${_entityType} ${_entityId}`);
  }
}
