import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}

export class CommentResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
  };
  parentId?: number;
  replies: CommentResponseDto[];
}
