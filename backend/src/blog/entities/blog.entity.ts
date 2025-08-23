import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../account/user/entities/user.entity';
import { BlogComment } from './blog-comment.entity';
import { BlogVote } from './blog-vote.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  featuredImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: number;

  @OneToMany(() => BlogComment, (comment) => comment.blog, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: BlogComment[];

  @OneToMany(() => BlogVote, (vote) => vote.blog, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  votes: BlogVote[];

  // Virtual fields for frontend
  upvoteCount?: number;
  downvoteCount?: number;
  userVote?: 'up' | 'down' | null;
}
