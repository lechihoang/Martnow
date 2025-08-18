import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class MediaUploadDto {
  @IsString()
  entityType: string; // 'product', 'user', 'seller'

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  entityId: number;

  // Files will be handled by multer, not validated here
  files?: any[];
}
