import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'nestjs-cloudinary';
import { User } from '../account/user/entities/user.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Upload avatar cho user
   */
  async uploadAvatar(userId: string, file: any): Promise<string> {
    // Upload to Cloudinary
    const result = await this.cloudinaryService.uploadFile(file, {
      folder: `foodee/users/${userId}/avatar`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

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
    files: any[],
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const result = await this.cloudinaryService.uploadFile(file, {
        folder: `foodee/products/${productId}`,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });
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
  async uploadFile(file: any, type: string = 'general'): Promise<{ secureUrl: string }> {
    const result = await this.cloudinaryService.uploadFile(file, {
      folder: `foodee/${type}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return { secureUrl: result.secure_url };
  }

  /**
   * Delete all media files for a specific entity
   */
  async deleteAllMediaFiles(
    entityType: string,
    entityId: string,
  ): Promise<void> {
    try {
      // For now, just log the deletion request
      // In a real implementation, you would query the database for all media files
      // associated with this entity and delete them from Cloudinary
      console.log(`Deleting all media files for ${entityType} ${entityId}`);
    } catch (error) {
      console.error('Failed to delete media files:', error);
    }
  }
}
