import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  categoryId: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;
}
