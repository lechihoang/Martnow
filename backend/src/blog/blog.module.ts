import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';
import { BlogComment } from './entities/blog-comment.entity';
import { BlogVote } from './entities/blog-vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, BlogComment, BlogVote])],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
