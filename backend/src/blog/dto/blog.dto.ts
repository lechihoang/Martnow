import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(100000) // 100KB text limit
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  featuredImage?: string;
}

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(100000) // 100KB text limit
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
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
