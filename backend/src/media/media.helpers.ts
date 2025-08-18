import { MediaService } from './media.service';
import { MediaFile } from './entities/media-file.entity';

/**
 * Helper functions for media handling across different entities
 */
export class MediaHelpers {
  
  /**
   * Upload and associate media files with a user (avatar)
   * @param mediaService MediaService instance
   * @param userId User ID
   * @param files Files to upload
   * @returns Promise<MediaFile[]>
   */
  static async uploadUserAvatar(
    mediaService: MediaService,
    userId: number,
    files: any[]
  ): Promise<MediaFile[]> {
    return mediaService.uploadMediaFiles({
      entityType: 'user',
      entityId: userId,
      files,
    });
  }

  /**
   * Upload and associate media files with a product
   * @param mediaService MediaService instance
   * @param productId Product ID
   * @param files Files to upload
   * @returns Promise<MediaFile[]>
   */
  static async uploadProductImages(
    mediaService: MediaService,
    productId: number,
    files: any[]
  ): Promise<MediaFile[]> {
    return mediaService.uploadMediaFiles({
      entityType: 'product',
      entityId: productId,
      files,
    });
  }

  /**
   * Upload and associate media files with a seller (shop images)
   * @param mediaService MediaService instance
   * @param sellerId Seller ID
   * @param files Files to upload
   * @returns Promise<MediaFile[]>
   */
  static async uploadSellerImages(
    mediaService: MediaService,
    sellerId: number,
    files: any[]
  ): Promise<MediaFile[]> {
    return mediaService.uploadMediaFiles({
      entityType: 'seller',
      entityId: sellerId,
      files,
    });
  }

  /**
   * Get primary media file for an entity
   * @param mediaService MediaService instance
   * @param entityType Entity type (user, product, seller)
   * @param entityId Entity ID
   * @returns Promise<MediaFile | null>
   */
  static async getPrimaryMedia(
    mediaService: MediaService,
    entityType: string,
    entityId: number
  ): Promise<MediaFile | null> {
    const mediaFiles = await mediaService.getMediaFiles(entityType, entityId);
    return mediaFiles.find(file => file.isPrimary) || mediaFiles[0] || null;
  }

  /**
   * Get user avatar URL
   * @param mediaService MediaService instance
   * @param userId User ID
   * @returns Promise<string | null>
   */
  static async getUserAvatarUrl(
    mediaService: MediaService,
    userId: number
  ): Promise<string | null> {
    const primaryMedia = await this.getPrimaryMedia(mediaService, 'user', userId);
    return primaryMedia?.secureUrl || null;
  }

  /**
   * Get product primary image URL
   * @param mediaService MediaService instance
   * @param productId Product ID
   * @returns Promise<string | null>
   */
  static async getProductPrimaryImageUrl(
    mediaService: MediaService,
    productId: number
  ): Promise<string | null> {
    const primaryMedia = await this.getPrimaryMedia(mediaService, 'product', productId);
    return primaryMedia?.secureUrl || null;
  }

  /**
   * Delete all media for an entity and clean up Cloudinary
   * @param mediaService MediaService instance
   * @param entityType Entity type
   * @param entityId Entity ID
   */
  static async deleteEntityMedia(
    mediaService: MediaService,
    entityType: string,
    entityId: number
  ): Promise<void> {
    await mediaService.deleteAllMediaFiles(entityType, entityId);
  }

  /**
   * Transform MediaFile to simple URL for API responses
   * @param mediaFile MediaFile entity
   * @returns Simple media object for API
   */
  static transformMediaFileForAPI(mediaFile: MediaFile) {
    return {
      id: mediaFile.id,
      url: mediaFile.secureUrl,
      fileName: mediaFile.fileName,
      fileType: mediaFile.fileType,
      isPrimary: mediaFile.isPrimary,
      createdAt: mediaFile.createdAt,
    };
  }

  /**
   * Transform array of MediaFiles for API responses
   * @param mediaFiles Array of MediaFile entities
   * @returns Array of simple media objects
   */
  static transformMediaFilesForAPI(mediaFiles: MediaFile[]) {
    return mediaFiles.map(file => this.transformMediaFileForAPI(file));
  }
}
