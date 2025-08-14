import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general'
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);
      
      // Generate unique public ID
      const fileExtension = file.originalname.split('.').pop();
      const publicId = `${folder}/${uuidv4()}`;
      
      // Determine resource type
      const resourceType = this.getResourceType(file.mimetype);
      
      // Upload options
      const uploadOptions: any = {
        public_id: publicId,
        folder,
        resource_type: resourceType,
        quality: 'auto',
        fetch_format: 'auto',
      };
      
      // For images, add transformation options
      if (resourceType === 'image') {
        uploadOptions.transformation = [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ];
      }
      
      // For videos, add video-specific options
      if (resourceType === 'video') {
        uploadOptions.video_codec = 'auto';
        uploadOptions.quality = 'auto';
      }
      
      // Convert buffer to base64 for upload
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(base64String, uploadOptions, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed without error details'));
          }
        });
      });

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: result.width,
        height: result.height,
        duration: result.duration,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'general'
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      // Determine resource type from public_id or try both
      const resourceTypes = ['image', 'video'];
      
      for (const resourceType of resourceTypes) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
          break; // If successful, break the loop
        } catch (error) {
          // Continue to next resource type
          continue;
        }
      }
    } catch (error) {
      console.error(`Failed to delete file ${publicId}:`, error.message);
      // Don't throw error to not block database record deletion
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    const deletePromises = publicIds.map(publicId => this.deleteFile(publicId));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Generate transformation URL for images
   */
  generateTransformationUrl(
    publicId: string,
    transformations: any[]
  ): string {
    return cloudinary.url(publicId, {
      transformation: transformations,
      secure: true,
    });
  }

  /**
   * Generate thumbnail URL for images
   */
  generateThumbnailUrl(
    publicId: string,
    width: number = 300,
    height: number = 300
  ): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
      secure: true,
    });
  }

  /**
   * Generate video thumbnail
   */
  generateVideoThumbnail(
    publicId: string,
    width: number = 300,
    height: number = 300
  ): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'jpg', // Convert video frame to jpg
      start_offset: '1', // Take frame at 1 second
      secure: true,
    });
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Express.Multer.File): void {
    const maxSize = 100 * 1024 * 1024; // 100MB for Cloudinary
    const allowedMimeTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo', // .avi
      'video/webm',
      'video/x-flv',
      'video/3gpp',
    ];

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 100MB limit');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not supported`);
    }
  }

  /**
   * Get resource type for Cloudinary
   */
  private getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }

  /**
   * Generate folder path based on entity type
   */
  generateFolderPath(entityType: string, entityId?: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    if (entityId) {
      return `foodee/${entityType}/${year}/${month}/${entityId}`;
    }
    
    return `foodee/${entityType}/${year}/${month}`;
  }

  /**
   * Get file info from Cloudinary
   */
  async getFileInfo(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId, { resource_type: resourceType });
    } catch (error) {
      throw new BadRequestException(`Failed to get file info: ${error.message}`);
    }
  }
}
