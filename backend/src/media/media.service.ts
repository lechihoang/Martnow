import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaFile } from './entities/media-file.entity';
import { CloudinaryService } from 'nestjs-cloudinary';
import { MediaUploadDto } from './dto/media-upload.dto';
import { User } from '../account/user/entities/user.entity';

export interface MediaUploadServiceDto {
  entityType: string;
  entityId: number;
  files: any[];
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaFile)
    private mediaRepository: Repository<MediaFile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Upload media files cho entity
   */
  async uploadMediaFiles(dto: MediaUploadDto): Promise<MediaFile[]> {
    const { entityType, entityId, files } = dto;
    
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }
    
    // Upload files to Cloudinary using nestjs-cloudinary
    const uploadPromises = files.map(async (file, index) => {
      // Generate folder path for each file
      const folder = `foodee/${entityType}/${entityId}`;
      
      // Upload options
      const uploadOptions = {
        folder: folder,
        resource_type: 'auto' as const, // auto detect image/video
        quality: 'auto',
        fetch_format: 'auto'
      };
      
      // Upload file using nestjs-cloudinary
      const result = await this.cloudinaryService.uploadFile(file, uploadOptions);
      
      return {
        fileName: file.originalname,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        fileType: this.getFileType(file.mimetype),
        entityType,
        entityId,
        isPrimary: index === 0, // First file is primary
      };
    });
    
    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    
    // Save media files to database
    const savedFiles = await this.mediaRepository.save(
      uploadResults.map(result => this.mediaRepository.create(result))
    ) as MediaFile[];
    
    // If uploading avatar for user, update User entity
    if (entityType === 'user' && savedFiles.length > 0) {
      const primaryFile = savedFiles.find(file => file.isPrimary) || savedFiles[0];
      if (primaryFile) {
        await this.userRepository.update(
          { id: entityId },
          { avatar: primaryFile.secureUrl }
        );
      }
    }
    
    return savedFiles;
  }


  /**
   * Get all media files for an entity
   */
  async getMediaFiles(entityType: string, entityId: number): Promise<MediaFile[]> {
    return this.mediaRepository.find({
      where: { entityType, entityId },
      order: { 
        isPrimary: 'DESC', // Primary first
        createdAt: 'ASC'   // Then by upload order
      }
    });
  }

  /**
   * Delete all media files for an entity
   */
  async deleteAllMediaFiles(entityType: string, entityId: number): Promise<void> {
    const mediaFiles = await this.mediaRepository.find({
      where: { entityType, entityId }
    });
    
    if (mediaFiles.length === 0) return;
    
    // Get Cloudinary public_ids
    const publicIds = mediaFiles.map(file => file.publicId);
    
    // Delete from database
    await this.mediaRepository.delete({ entityType, entityId });
    
    // Delete from Cloudinary using cloudinary instance (async)
    // Use Promise.all to properly handle all async operations
    const deletePromises = publicIds.map(async (publicId) => {
      try {
        // Try both image and video resource types
        await this.cloudinaryService.cloudinaryInstance.uploader.destroy(publicId, { resource_type: 'image' });
      } catch (error) {
        try {
          await this.cloudinaryService.cloudinaryInstance.uploader.destroy(publicId, { resource_type: 'video' });
        } catch (videoError) {
          console.error(`Failed to delete ${publicId}:`, error.message);
        }
      }
    });
    
    // Wait for all deletions to complete (but don't block the main operation)
    Promise.all(deletePromises).catch(error => {
      console.error('Some Cloudinary deletions failed:', error);
    });
  }

  /**
   * Helper: Determine file type from mime type
   */
  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'other';
  }
}
