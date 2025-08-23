import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../account/user/entities/user.entity';
import { Blog } from './blog.entity';

export enum VoteType {
  UP = 'up',
  DOWN = 'down',
}

@Entity('blog_votes')
@Unique(['userId', 'blogId'])
export class BlogVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  voteType: VoteType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column()
  blogId: number;
}
