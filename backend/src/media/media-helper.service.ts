import { Injectable } from '@nestjs/common';
import { MediaService } from './media.service';
import { CloudinaryService } from './cloudinary.service';
import { MediaFile } from './entities/media-file.entity';

export interface EntityWithMedia {
  id: number;
  mediaFiles?: MediaFile[];
  primaryMediaFile?: MediaFile;
}

@Injectable()
export class MediaHelperService {
  constructor(
    private mediaService: MediaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Helper để upload media cho entity và return entity với media files
   */
  async uploadAndAttachMedia<T extends EntityWithMedia>(
    entity: T,
    entityType: string,
    files: Express.Multer.File[],
    options: {
      setPrimaryToFirst?: boolean;
      maxFiles?: number;
    } = {}
  ): Promise<T> {
    const { setPrimaryToFirst = true, maxFiles = 10 } = options;

    if (!files || files.length === 0) {
      return entity;
    }

    // Limit number of files
    const filesToUpload = files.slice(0, maxFiles);
    
    // Create isPrimary array
    const isPrimary = setPrimaryToFirst 
      ? [true, ...Array(filesToUpload.length - 1).fill(false)]
      : Array(filesToUpload.length).fill(false);

    // Upload media files
    const mediaFiles = await this.mediaService.uploadMediaFiles({
      entityType,
      entityId: entity.id,
      files: filesToUpload,
      isPrimary,
    });

    // Attach to entity
    entity.mediaFiles = mediaFiles;
    entity.primaryMediaFile = mediaFiles.find(file => file.isPrimary);

    return entity;
  }

  /**
   * Helper để get entity với media files
   */
  async attachMediaToEntity<T extends EntityWithMedia>(
    entity: T,
    entityType: string
  ): Promise<T> {
    if (!entity || !entity.id) {
      return entity;
    }

    const mediaFiles = await this.mediaService.getMediaFiles(entityType, entity.id);
    entity.mediaFiles = mediaFiles;
    entity.primaryMediaFile = mediaFiles.find(file => file.isPrimary) || mediaFiles[0];

    return entity;
  }

  /**
   * Helper để get multiple entities với media files
   */
  async attachMediaToEntities<T extends EntityWithMedia>(
    entities: T[],
    entityType: string
  ): Promise<T[]> {
    if (!entities || entities.length === 0) {
      return entities;
    }

    // Get all entity IDs
    const entityIds = entities.map(entity => entity.id);

    // Get all media files for these entities
    const allMediaFiles = await Promise.all(
      entityIds.map(id => this.mediaService.getMediaFiles(entityType, id))
    );

    // Attach media files to entities
    entities.forEach((entity, index) => {
      const mediaFiles = allMediaFiles[index];
      entity.mediaFiles = mediaFiles;
      entity.primaryMediaFile = mediaFiles.find(file => file.isPrimary) || mediaFiles[0];
    });

    return entities;
  }

  /**
   * Helper để update media cho entity
   */
  async updateEntityMedia<T extends EntityWithMedia>(
    entity: T,
    entityType: string,
    updateData: {
      filesToAdd?: Express.Multer.File[];
      filesToDelete?: number[];
      primaryFileId?: number;
    }
  ): Promise<T> {
    const mediaFiles = await this.mediaService.updateMediaFiles({
      entityType,
      entityId: entity.id,
      ...updateData,
    });

    entity.mediaFiles = mediaFiles;
    entity.primaryMediaFile = mediaFiles.find(file => file.isPrimary) || mediaFiles[0];

    return entity;
  }

  /**
   * Helper để delete tất cả media của entity
   */
  async deleteAllEntityMedia(entityType: string, entityId: number): Promise<void> {
    await this.mediaService.deleteAllMediaFiles(entityType, entityId);
  }

  /**
   * Helper để generate thumbnail URLs cho một list media files
   */
  generateThumbnailUrls(
    mediaFiles: MediaFile[],
    width: number = 300,
    height: number = 300
  ): { mediaFile: MediaFile; thumbnailUrl: string }[] {
    return mediaFiles.map(mediaFile => ({
      mediaFile,
      thumbnailUrl: mediaFile.fileType === 'video'
        ? this.cloudinaryService.generateVideoThumbnail(mediaFile.publicId, width, height)
        : this.cloudinaryService.generateThumbnailUrl(mediaFile.publicId, width, height)
    }));
  }

  /**
   * Helper để generate different size thumbnails
   */
  generateResponsiveUrls(
    publicId: string,
    fileType: 'image' | 'video'
  ): {
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    const baseOptions = {
      quality: 'auto',
      format: 'auto',
    };

    if (fileType === 'video') {
      return {
        small: this.cloudinaryService.generateVideoThumbnail(publicId, 150, 150),
        medium: this.cloudinaryService.generateVideoThumbnail(publicId, 300, 300),
        large: this.cloudinaryService.generateVideoThumbnail(publicId, 600, 600),
        original: this.cloudinaryService.generateVideoThumbnail(publicId, 1200, 1200),
      };
    }

    return {
      small: this.cloudinaryService.generateThumbnailUrl(publicId, 150, 150),
      medium: this.cloudinaryService.generateThumbnailUrl(publicId, 300, 300),
      large: this.cloudinaryService.generateThumbnailUrl(publicId, 600, 600),
      original: this.cloudinaryService.generateTransformationUrl(publicId, [baseOptions]),
    };
  }

  /**
   * Helper để validate uploaded files
   */
  validateFiles(
    files: Express.Multer.File[],
    options: {
      maxFiles?: number;
      maxSizePerFile?: number; // in bytes
      allowedTypes?: string[];
    } = {}
  ): { isValid: boolean; errors: string[] } {
    const {
      maxFiles = 10,
      maxSizePerFile = 100 * 1024 * 1024, // 100MB
      allowedTypes = [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/mpeg',
        'video/quicktime'
      ]
    } = options;

    const errors: string[] = [];

    if (!files || files.length === 0) {
      errors.push('No files provided');
      return { isValid: false, errors };
    }

    if (files.length > maxFiles) {
      errors.push(`Too many files. Maximum allowed: ${maxFiles}`);
    }

    files.forEach((file, index) => {
      if (file.size > maxSizePerFile) {
        errors.push(`File ${index + 1} (${file.originalname}) exceeds size limit of ${maxSizePerFile / (1024 * 1024)}MB`);
      }

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`File ${index + 1} (${file.originalname}) has unsupported type: ${file.mimetype}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper để format media files cho API response
   */
  formatMediaFilesForResponse(mediaFiles: MediaFile[]): any[] {
    return mediaFiles.map(file => ({
      id: file.id,
      fileName: file.fileName,
      url: file.secureUrl,
      thumbnailUrl: file.thumbnailUrl,
      fileType: file.fileType,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      width: file.width,
      height: file.height,
      duration: file.duration,
      isPrimary: file.isPrimary,
      sortOrder: file.sortOrder,
      createdAt: file.createdAt,
      // Add responsive URLs
      responsiveUrls: this.generateResponsiveUrls(file.publicId, file.fileType as 'image' | 'video'),
    }));
  }
}
