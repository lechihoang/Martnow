import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService, MediaUploadDto, MediaUpdateDto } from './media.service';
import { CloudinaryService } from './cloudinary.service';

interface UploadMediaDto {
  entityType: string;
  entityId: number;
  isPrimary?: boolean[];
}

interface UpdateMediaDto {
  filesToDelete?: number[];
  primaryFileId?: number;
}

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Upload media files for an entity
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadDto: MediaUploadDto = {
      entityType: dto.entityType,
      entityId: parseInt(dto.entityId as any),
      files,
      isPrimary: dto.isPrimary,
    };

    const mediaFiles = await this.mediaService.uploadMediaFiles(uploadDto);
    
    return {
      status: 'success',
      message: `Successfully uploaded ${mediaFiles.length} files`,
      data: mediaFiles,
    };
  }

  /**
   * Update media files - add/remove files
   */
  @Put(':entityType/:entityId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async updateMedia(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UpdateMediaDto,
  ) {
    const updateDto: MediaUpdateDto = {
      entityType,
      entityId,
      filesToDelete: dto.filesToDelete,
      filesToAdd: files || [],
      primaryFileId: dto.primaryFileId,
    };

    const mediaFiles = await this.mediaService.updateMediaFiles(updateDto);
    
    return {
      status: 'success',
      message: 'Media files updated successfully',
      data: mediaFiles,
    };
  }

  /**
   * Get all media files for an entity
   */
  @Get(':entityType/:entityId')
  async getMediaFiles(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    const mediaFiles = await this.mediaService.getMediaFiles(entityType, entityId);
    
    return {
      status: 'success',
      data: mediaFiles,
    };
  }

  /**
   * Delete all media files for an entity
   */
  @Delete(':entityType/:entityId')
  async deleteAllMedia(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    await this.mediaService.deleteAllMediaFiles(entityType, entityId);
    
    return {
      status: 'success',
      message: 'All media files deleted successfully',
    };
  }

  /**
   * Set primary media file
   */
  @Put('primary/:mediaFileId')
  async setPrimaryMedia(
    @Param('mediaFileId', ParseIntPipe) mediaFileId: number,
  ) {
    await this.mediaService.setPrimaryMediaFile(mediaFileId);
    
    return {
      status: 'success',
      message: 'Primary media file updated successfully',
    };
  }

  /**
   * Reorder media files
   */
  @Put('reorder/:entityType/:entityId')
  async reorderMedia(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Body('fileIds') fileIds: number[],
  ) {
    await this.mediaService.reorderMediaFiles(entityType, entityId, fileIds);
    
    return {
      status: 'success',
      message: 'Media files reordered successfully',
    };
  }

  /**
   * Generate thumbnail URL for a media file
   */
  @Get('thumbnail/:mediaFileId')
  async getThumbnail(
    @Param('mediaFileId', ParseIntPipe) mediaFileId: number,
  ) {
    const mediaFile = await this.mediaService.getPrimaryMediaFile('', mediaFileId);
    
    if (!mediaFile) {
      throw new BadRequestException('Media file not found');
    }

    let thumbnailUrl: string;
    if (mediaFile.fileType === 'video') {
      thumbnailUrl = this.cloudinaryService.generateVideoThumbnail(mediaFile.publicId);
    } else {
      thumbnailUrl = this.cloudinaryService.generateThumbnailUrl(mediaFile.publicId);
    }
    
    return {
      status: 'success',
      data: {
        thumbnailUrl,
        originalUrl: mediaFile.secureUrl,
      },
    };
  }

  /**
   * Generate transformed image URL
   */
  @Post('transform')
  async generateTransformationUrl(
    @Body('publicId') publicId: string,
    @Body('transformations') transformations: any[],
  ) {
    const transformedUrl = this.cloudinaryService.generateTransformationUrl(
      publicId,
      transformations
    );
    
    return {
      status: 'success',
      data: {
        transformedUrl,
      },
    };
  }
}
