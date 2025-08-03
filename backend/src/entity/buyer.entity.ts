

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Buyer {
  @PrimaryGeneratedColumn()
  id: number; // id duy nhất của bảng Buyer

  @Column({ unique: true })
  userId: number; // liên kết với id của bảng User, duy nhất

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
