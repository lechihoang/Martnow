import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MediaFile } from './entities/media-file.entity';
import { CloudinaryService, UploadResult } from './cloudinary.service';

export interface MediaUploadDto {
  entityType: string; // 'product', 'user', 'restaurant'
  entityId: number;
  files: Express.Multer.File[];
  isPrimary?: boolean[];
}

export interface MediaUpdateDto {
  entityType: string;
  entityId: number;
  filesToDelete?: number[]; // IDs của media files cần xóa
  filesToAdd?: Express.Multer.File[]; // Files mới cần thêm
  primaryFileId?: number; // ID của file sẽ được set làm primary
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaFile)
    private mediaRepository: Repository<MediaFile>,
    private cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
  ) {}

  /**
   * Upload media files cho entity
   */
  async uploadMediaFiles(dto: MediaUploadDto): Promise<MediaFile[]> {
    const { entityType, entityId, files, isPrimary = [] } = dto;
    
    // Generate folder path
    const folder = this.cloudinaryService.generateFolderPath(entityType, entityId);
    
    // Upload files to Cloudinary
    const uploadResults = await this.cloudinaryService.uploadMultipleFiles(files, folder);
    
    // Create MediaFile entities
    const mediaFiles: MediaFile[] = [];
    
    for (let i = 0; i < uploadResults.length; i++) {
      const result = uploadResults[i];
      const mediaFile = this.mediaRepository.create({
        fileName: result.fileName,
        publicId: result.publicId,
        url: result.url,
        secureUrl: result.secureUrl,
        fileType: this.getFileType(result.mimeType),
        mimeType: result.mimeType,
        fileSize: result.fileSize,
        width: result.width,
        height: result.height,
        duration: result.duration,
        entityType,
        entityId,
        isPrimary: isPrimary[i] || false,
        sortOrder: i,
      });
      
      mediaFiles.push(mediaFile);
    }
    
    // Save to database
    return this.mediaRepository.save(mediaFiles);
  }

  /**
   * Update media files - Incremental approach
   */
  async updateMediaFiles(dto: MediaUpdateDto): Promise<MediaFile[]> {
    const { entityType, entityId, filesToDelete = [], filesToAdd = [], primaryFileId } = dto;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 1. Delete specified files
      if (filesToDelete.length > 0) {
        // Get Cloudinary public_ids before deleting from DB
        const filesToDeleteFromCloudinary = await queryRunner.manager
          .getRepository(MediaFile)
          .findBy({ id: { $in: filesToDelete } as any });
        
        const publicIds = filesToDeleteFromCloudinary.map(file => file.publicId);
        
        // Delete from database first
        await queryRunner.manager
          .getRepository(MediaFile)
          .delete(filesToDelete);
        
        // Delete from Cloudinary (async, don't wait)
        this.cloudinaryService.deleteMultipleFiles(publicIds).catch(error => {
          console.error('Failed to delete files from Cloudinary:', error);
        });
      }
      
      // 2. Add new files
      const newMediaFiles: MediaFile[] = [];
      if (filesToAdd.length > 0) {
        const folder = this.cloudinaryService.generateFolderPath(entityType, entityId);
        const uploadResults = await this.cloudinaryService.uploadMultipleFiles(filesToAdd, folder);
        
        // Get current max sortOrder
        const maxSortOrder = await queryRunner.manager
          .getRepository(MediaFile)
          .createQueryBuilder('media')
          .select('MAX(media.sortOrder)', 'max')
          .where('media.entityType = :entityType AND media.entityId = :entityId', 
                 { entityType, entityId })
          .getRawOne();
        
        const startingSortOrder = (maxSortOrder?.max || 0) + 1;
        
        for (let i = 0; i < uploadResults.length; i++) {
          const result = uploadResults[i];
          const mediaFile = queryRunner.manager.getRepository(MediaFile).create({
            fileName: result.fileName,
            publicId: result.publicId,
            url: result.url,
            secureUrl: result.secureUrl,
            fileType: this.getFileType(result.mimeType),
            mimeType: result.mimeType,
            fileSize: result.fileSize,
            width: result.width,
            height: result.height,
            duration: result.duration,
            entityType,
            entityId,
            isPrimary: false, // Set manually sau nếu cần
            sortOrder: startingSortOrder + i,
          });
          
          newMediaFiles.push(mediaFile);
        }
        
        await queryRunner.manager.getRepository(MediaFile).save(newMediaFiles);
      }
      
      // 3. Update primary file if specified
      if (primaryFileId) {
        // Reset all primary flags for this entity
        await queryRunner.manager
          .getRepository(MediaFile)
          .update(
            { entityType, entityId },
            { isPrimary: false }
          );
        
        // Set new primary
        await queryRunner.manager
          .getRepository(MediaFile)
          .update(primaryFileId, { isPrimary: true });
      }
      
      await queryRunner.commitTransaction();
      
      // Return all current media files for this entity
      return this.getMediaFiles(entityType, entityId);
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all media files for an entity
   */
  async getMediaFiles(entityType: string, entityId: number): Promise<MediaFile[]> {
    return this.mediaRepository.find({
      where: { entityType, entityId },
      order: { 
        isPrimary: 'DESC', // Primary first
        sortOrder: 'ASC'   // Then by sort order
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
    
    // Delete from Cloudinary (async)
    this.cloudinaryService.deleteMultipleFiles(publicIds).catch(error => {
      console.error('Failed to delete files from Cloudinary:', error);
    });
  }

  /**
   * Set primary media file
   */
  async setPrimaryMediaFile(mediaFileId: number): Promise<void> {
    const mediaFile = await this.mediaRepository.findOne({
      where: { id: mediaFileId }
    });
    
    if (!mediaFile) {
      throw new NotFoundException(`Media file with ID ${mediaFileId} not found`);
    }
    
    // Reset all primary flags for this entity
    await this.mediaRepository.update(
      { entityType: mediaFile.entityType, entityId: mediaFile.entityId },
      { isPrimary: false }
    );
    
    // Set new primary
    await this.mediaRepository.update(mediaFileId, { isPrimary: true });
  }

  /**
   * Get primary media file for entity
   */
  async getPrimaryMediaFile(entityType: string, entityId: number): Promise<MediaFile | null> {
    return this.mediaRepository.findOne({
      where: { 
        entityType, 
        entityId, 
        isPrimary: true 
      }
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

  /**
   * Reorder media files
   */
  async reorderMediaFiles(
    entityType: string, 
    entityId: number, 
    fileIds: number[]
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      for (let i = 0; i < fileIds.length; i++) {
        await queryRunner.manager
          .getRepository(MediaFile)
          .update(
            { 
              id: fileIds[i], 
              entityType, 
              entityId 
            },
            { sortOrder: i }
          );
      }
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
