import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'nestjs-cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { User } from '../account/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
        api_key: config.get('CLOUDINARY_API_KEY'),
        api_secret: config.get('CLOUDINARY_API_SECRET'),
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
