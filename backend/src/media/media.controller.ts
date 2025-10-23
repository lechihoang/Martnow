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

@Controller('media')
@UseGuards(SupabaseAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload avatar cho user
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: IFile, @Req() req: RequestWithUser) {
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
  ) {
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
  ) {
    const type = body.type || 'general';
    const uploadResult = await this.mediaService.uploadFile(file, type);

    return {
      status: 'success',
      message: 'File uploaded successfully',
      data: [uploadResult], // Return as array to match frontend expectation
    };
  }
}
