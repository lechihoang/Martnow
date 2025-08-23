import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;
}

export class BlogResponseDto {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  featuredImage?: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    name: string;
  };
  comments: any[];
  upvoteCount?: number;
  downvoteCount?: number;
  userVote?: 'up' | 'down' | null;
}
