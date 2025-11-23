import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000) // 2KB limit for comments
  content: string;

  // Removed parentId since we no longer support reply functionality
  // @IsOptional()
  // @IsNumber()
  // parentId?: number;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000) // 2KB limit for comments
  content: string;
}

export class CommentResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  user: {
    id: number;
    name: string;
  };
}
