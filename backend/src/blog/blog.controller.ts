import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/blog-comment.dto';
import { VoteBlogDto } from './dto/blog-vote.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { UserRole } from '../lib/supabase';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Blog endpoints
  @Get()
  async getAllBlogs(
    @Request() req?: ExpressRequest & { user?: { id: number } },
  ) {
    const userId = req?.user?.id;
    return this.blogService.findAllBlogs(userId);
  }

  @Get(':id')
  async getBlogById(
    @Param('id') id: string,
    @Request() req?: ExpressRequest & { user?: { id: number } },
  ) {
    const userId = req?.user?.id;
    return this.blogService.findBlogById(+id, userId);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.createBlog(createBlogDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.updateBlog(+id, updateBlogDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async deleteBlog(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.deleteBlog(+id, req.user.id);
  }

  // Comment endpoints
  @Get(':id/comments')
  async getComments(@Param('id') blogId: string) {
    return this.blogService.findCommentsByBlogId(+blogId);
  }

  @Post(':id/comments')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async createComment(
    @Param('id') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.createComment(
      +blogId,
      createCommentDto,
      req.user.id,
    );
  }

  @Put('comments/:commentId')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.updateComment(
      +commentId,
      updateCommentDto,
      req.user.id,
    );
  }

  @Delete('comments/:commentId')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.deleteComment(+commentId, req.user.id);
  }

  // Vote endpoints
  @Post(':id/vote')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async voteBlog(
    @Param('id') blogId: string,
    @Body() voteBlogDto: VoteBlogDto,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.voteBlog(+blogId, voteBlogDto, req.user.id);
  }

  @Delete(':id/vote')
  @UseGuards(SupabaseAuthGuard, RoleGuard)
  @Roles(UserRole.BUYER, UserRole.SELLER)
  async unvoteBlog(
    @Param('id') blogId: string,
    @Request() req: ExpressRequest & { user: { id: number } },
  ) {
    return this.blogService.unvoteBlog(+blogId, req.user.id);
  }

  @Get(':id/vote-stats')
  async getVoteStats(
    @Param('id') blogId: string,
    @Request() req?: ExpressRequest & { user?: { id: number } },
  ) {
    const userId = req?.user?.id;
    return this.blogService.getVoteStats(+blogId, userId);
  }
}
