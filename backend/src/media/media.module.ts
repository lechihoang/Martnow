import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MediaFile } from './entities/media-file.entity';
import { MediaService } from './media.service';
import { CloudinaryService } from './cloudinary.service';
import { MediaHelperService } from './media-helper.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaFile]),
    ConfigModule, // Add ConfigModule for environment variables
  ],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService, MediaHelperService],
  exports: [MediaService, CloudinaryService, MediaHelperService], // Export để dùng trong modules khác
})
export class MediaModule {}
