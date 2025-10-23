import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { BlogComment } from './entities/blog-comment.entity';
import { BlogVote, VoteType } from './entities/blog-vote.entity';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/blog-comment.dto';
import { VoteBlogDto, VoteResponseDto } from './dto/blog-vote.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(BlogComment)
    private commentRepository: Repository<BlogComment>,
    @InjectRepository(BlogVote)
    private voteRepository: Repository<BlogVote>,
  ) {}

  // Blog CRUD
  async createBlog(
    createBlogDto: CreateBlogDto,
    authorId: number,
  ): Promise<Blog> {
    const blog = this.blogRepository.create({
      ...createBlogDto,
      authorId,
    });
    return this.blogRepository.save(blog);
  }

  async findAllBlogs(userId?: number): Promise<Blog[]> {
    const blogs = await this.blogRepository.find({
      relations: ['author', 'comments', 'comments.user', 'votes'],
      order: { createdAt: 'DESC' },
    });

    return this.enrichBlogsWithVoteData(blogs, userId);
  }

  async findBlogById(id: number, userId?: number): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.user', 'votes'],
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.enrichBlogWithVoteData(blog, userId);
  }

  async updateBlog(
    id: number,
    updateBlogDto: UpdateBlogDto,
    userId: number,
  ): Promise<Blog> {
    const blog = await this.findBlogById(id);

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only update your own blogs');
    }

    await this.blogRepository.update(id, updateBlogDto);
    return this.findBlogById(id);
  }

  async deleteBlog(id: number, userId: number): Promise<void> {
    const blog = await this.findBlogById(id);

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    await this.blogRepository.delete(id);
  }

  // Comment CRUD
  async createComment(
    blogId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<BlogComment> {
    await this.findBlogById(blogId);

    const comment = this.commentRepository.create({
      ...createCommentDto,
      blogId,
      userId,
    });

    return this.commentRepository.save(comment);
  }

  async updateComment(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<BlogComment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    await this.commentRepository.update(id, updateCommentDto);
    const updatedComment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!updatedComment) {
      throw new NotFoundException('Comment not found after update');
    }

    return updatedComment;
  }

  async deleteComment(id: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Simple hard delete for flat comment structure
    await this.commentRepository.delete(id);
  }

  async findCommentsByBlogId(blogId: number): Promise<BlogComment[]> {
    return this.commentRepository.find({
      where: { blogId }, // All comments (no longer hierarchical)
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Voting methods
  async voteBlog(
    blogId: number,
    voteBlogDto: VoteBlogDto,
    userId: number,
  ): Promise<VoteResponseDto> {
    await this.findBlogById(blogId);

    // Check if user already voted
    const existingVote = await this.voteRepository.findOne({
      where: { blogId, userId },
    });

    if (existingVote) {
      if (existingVote.voteType === voteBlogDto.voteType) {
        // Same vote type, remove vote (toggle off)
        await this.voteRepository.delete(existingVote.id);
      } else {
        // Different vote type, update
        await this.voteRepository.update(existingVote.id, {
          voteType: voteBlogDto.voteType,
        });
      }
    } else {
      // Create new vote
      const vote = this.voteRepository.create({
        blogId,
        userId,
        voteType: voteBlogDto.voteType,
      });
      await this.voteRepository.save(vote);
    }

    return this.getVoteStats(blogId, userId);
  }

  async unvoteBlog(blogId: number, userId: number): Promise<VoteResponseDto> {
    await this.voteRepository.delete({ blogId, userId });
    return this.getVoteStats(blogId, userId);
  }

  async getVoteStats(
    blogId: number,
    userId?: number,
  ): Promise<VoteResponseDto> {
    const votes = await this.voteRepository.find({ where: { blogId } });

    const upvoteCount = votes.filter((v) => v.voteType === VoteType.UP).length;
    const downvoteCount = votes.filter(
      (v) => v.voteType === VoteType.DOWN,
    ).length;

    let userVote: 'up' | 'down' | null = null;
    if (userId) {
      const userVoteEntity = votes.find((v) => v.userId === userId);
      userVote = userVoteEntity ? userVoteEntity.voteType : null;
    }

    return { upvoteCount, downvoteCount, userVote };
  }

  // Helper methods
  private enrichBlogWithVoteData(blog: Blog, userId?: number): Blog {
    const upvoteCount = blog.votes
      ? blog.votes.filter((v) => v.voteType === VoteType.UP).length
      : 0;
    const downvoteCount = blog.votes
      ? blog.votes.filter((v) => v.voteType === VoteType.DOWN).length
      : 0;

    let userVote: 'up' | 'down' | null = null;
    if (userId && blog.votes) {
      const userVoteEntity = blog.votes.find((v) => v.userId === userId);
      userVote = userVoteEntity ? userVoteEntity.voteType : null;
    }

    blog.upvoteCount = upvoteCount;
    blog.downvoteCount = downvoteCount;
    blog.userVote = userVote;

    // Comments are now flat (no replies)
    // No longer need to initialize replies since we removed reply functionality

    return blog;
  }

  private enrichBlogsWithVoteData(blogs: Blog[], userId?: number): Blog[] {
    return blogs.map((blog) => this.enrichBlogWithVoteData(blog, userId));
  }
}
