import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class MediaUploadDto {
  @IsString()
  entityType: string; // 'product', 'user', 'seller', 'blog', 'temp'

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => value ? parseInt(value) : null)
  entityId?: number;

  // Files will be handled by multer, not validated here
  files?: any[];
}
