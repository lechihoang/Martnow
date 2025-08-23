import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MediaUploadDto } from './dto/media-upload.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload media files for an entity
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadMedia(
    @UploadedFiles() files: any[],
    @Body() dto: MediaUploadDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadDto = {
      ...dto,
      files,
    };

    const mediaFiles = await this.mediaService.uploadMediaFiles(uploadDto);

    return {
      status: 'success',
      message: `Successfully uploaded ${mediaFiles.length} files`,
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
    const mediaFiles = await this.mediaService.getMediaFiles(
      entityType,
      entityId,
    );

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
}
