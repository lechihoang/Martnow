import { IsNumber } from 'class-validator';

export class AddToFavoriteDto {
  @IsNumber()
  productId: number;
}

export class RemoveFromFavoriteDto {
  @IsNumber()
  productId: number;
}
