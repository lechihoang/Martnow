import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../account/user/entities/user.entity';
import { Blog } from './blog.entity';

@Entity('blog_comments')
export class BlogComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relationships
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Blog, (blog) => blog.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column()
  blogId: number;

  // Remove reply functionality to simplify comment system
  // @ManyToOne(() => BlogComment, (comment) => comment.replies, {
  //   nullable: true,
  // })
  // @JoinColumn({ name: 'parentId' })
  // parent: BlogComment;

  // @Column({ nullable: true })
  // parentId: number;

  // @OneToMany(() => BlogComment, (comment) => comment.parent, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // replies: BlogComment[];
}
