import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from 'nestjs-cloudinary';
import { MediaFile } from './entities/media-file.entity';
import { User } from '../account/user/entities/user.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaFile, User]),
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Use individual credentials (more reliable with nestjs-cloudinary)
        const cloudName = configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = configService.get('CLOUDINARY_API_KEY');
        const apiSecret = configService.get('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
          throw new Error(
            'Cloudinary configuration is incomplete. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.',
          );
        }

        console.log('Cloudinary config:', {
          cloudName,
          apiKey: '***',
          apiSecret: '***',
        });

        return {
          isGlobal: true,
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService], // Export để dùng trong modules khác
})
export class MediaModule {}
