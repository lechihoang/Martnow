import { IsEnum } from 'class-validator';
import { VoteType } from '../entities/blog-vote.entity';

export class VoteBlogDto {
  @IsEnum(VoteType)
  voteType: VoteType;
}

export class VoteResponseDto {
  upvoteCount: number;
  downvoteCount: number;
  userVote: 'up' | 'down' | null;
}
