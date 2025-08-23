import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../account/user/entities/user.entity';
import { Message } from './message.entity';

@Entity('chat_rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean; // true for private chat, false for group

  @CreateDateColumn()
  createdAt: Date;

  // Participants in the room
  @ManyToMany(() => User)
  @JoinTable({
    name: 'room_participants',
    joinColumn: { name: 'roomId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];

  // All messages in this room
  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
