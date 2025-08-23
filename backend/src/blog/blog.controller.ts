import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/blog-comment.dto';
import { VoteBlogDto } from './dto/blog-vote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Blog endpoints
  @Get()
  async getAllBlogs(@Request() req?) {
    const userId = req?.user?.id;
    return this.blogService.findAllBlogs(userId);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string, @Request() req?) {
    const userId = req?.user?.id;
    return this.blogService.findBlogById(+id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req) {
    return this.blogService.createBlog(createBlogDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req,
  ) {
    return this.blogService.updateBlog(+id, updateBlogDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBlog(@Param('id') id: string, @Request() req) {
    return this.blogService.deleteBlog(+id, req.user.id);
  }

  // Comment endpoints
  @Get(':id/comments')
  async getComments(@Param('id') blogId: string) {
    return this.blogService.findCommentsByBlogId(+blogId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('id') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.blogService.createComment(+blogId, createCommentDto, req.user.id);
  }

  @Put('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.blogService.updateComment(+commentId, updateCommentDto, req.user.id);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    return this.blogService.deleteComment(+commentId, req.user.id);
  }

  // Vote endpoints
  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  async voteBlog(
    @Param('id') blogId: string,
    @Body() voteBlogDto: VoteBlogDto,
    @Request() req,
  ) {
    return this.blogService.voteBlog(+blogId, voteBlogDto, req.user.id);
  }

  @Delete(':id/vote')
  @UseGuards(JwtAuthGuard)
  async unvoteBlog(
    @Param('id') blogId: string,
    @Request() req,
  ) {
    return this.blogService.unvoteBlog(+blogId, req.user.id);
  }

  @Get(':id/vote-stats')
  async getVoteStats(@Param('id') blogId: string, @Request() req?) {
    const userId = req?.user?.id;
    return this.blogService.getVoteStats(+blogId, userId);
  }
}
