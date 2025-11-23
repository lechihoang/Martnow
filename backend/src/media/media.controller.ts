import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Req,
  Param,
  Body,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { IFile } from 'nestjs-cloudinary';

interface RequestWithUser {
  user: {
    id: string;
  };
}

// File validation constants
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = /(jpg|jpeg|png|gif|webp)$/i;

@Controller('media')
@UseGuards(SupabaseAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Validate image file
   */
  private validateImageFile(file: IFile, maxSize: number): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      );
    }

    // Check file type
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_IMAGE_TYPES.test(extension)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed',
      );
    }

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file MIME type');
    }
  }

  /**
   * Upload avatar cho user
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: IFile, @Req() req: RequestWithUser) {
    // Validate file
    this.validateImageFile(file, MAX_AVATAR_SIZE);

    const avatarUrl = await this.mediaService.uploadAvatar(req.user.id, file);

    return {
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: { avatarUrl },
    };
  }

  /**
   * Upload images cho product
   */
  @Post('products/:productId')
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 images
  async uploadProductImages(
    @Param('productId') productId: string,
    @UploadedFiles() files: IFile[],
    @Req() req: RequestWithUser,
  ) {
    // Validate all files
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed');
    }

    files.forEach((file) => {
      this.validateImageFile(file, MAX_IMAGE_SIZE);
    });

    // Verify product ownership (seller must own the product)
    await this.mediaService.verifyProductOwnership(productId, req.user.id);

    const imageUrls = await this.mediaService.uploadProductImages(
      productId,
      files,
    );

    return {
      status: 'success',
      message: `Successfully uploaded ${imageUrls.length} images`,
      data: { imageUrls },
    };
  }

  /**
   * Upload general file (for blogs, etc.)
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: IFile,
    @Body() body: { type?: string },
    @Req() req: RequestWithUser,
  ) {
    // Validate file
    this.validateImageFile(file, MAX_IMAGE_SIZE);

    const type = body.type || 'general';
    const uploadResult = await this.mediaService.uploadFile(file, type);

    return {
      status: 'success',
      message: 'File uploaded successfully',
      data: [uploadResult], // Return as array to match frontend expectation
    };
  }
}
