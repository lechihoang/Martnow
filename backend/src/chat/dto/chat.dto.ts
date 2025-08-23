import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { MessageType } from '../entities/message.entity';

// Room DTOs
export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean = false;

  @IsArray()
  @IsNumber({}, { each: true })
  participantIds: number[];
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RoomResponseDto {
  id: number;
  name: string;
  isPrivate: boolean;
  createdAt: Date;
  participants: any[];
  lastMessage?: any;

  constructor(room: any, currentUserId?: number) {
    this.id = room.id;
    this.name = room.name;
    this.isPrivate = room.isPrivate;
    this.createdAt = room.createdAt;

    // Format participants
    this.participants =
      room.participants?.map((p) => ({
        id: p.id,
        name: p.name,
        username: p.username,
        avatar: p.avatar,
      })) || [];

    // Get last message if available
    if (room.messages && room.messages.length > 0) {
      const lastMsg = room.messages[0];
      this.lastMessage = {
        id: lastMsg.id,
        content: lastMsg.content,
        type: lastMsg.type,
        createdAt: lastMsg.createdAt,
        user: {
          id: lastMsg.user?.id,
          name: lastMsg.user?.name,
          username: lastMsg.user?.username,
        },
      };
    }

    // For private rooms, set name based on other participant
    if (this.isPrivate && this.participants.length === 2 && currentUserId) {
      const otherUser = this.participants.find((p) => p.id !== currentUserId);
      if (otherUser) {
        this.name = otherUser.name;
      }
    }
  }
}

// Message DTOs
export class CreateMessageDto {
  @IsNumber()
  roomId: number;

  @IsNumber()
  userId: number;

  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  metadata?: any;
}

export class UpdateMessageDto {
  @IsString()
  content: string;
}

export class MessageResponseDto {
  id: number;
  userId: number;
  roomId: number;
  content: string;
  type: MessageType;
  metadata: any;
  createdAt: Date;
  user: any;
  mediaFiles?: any[];

  constructor(message: any) {
    this.id = message.id;
    this.userId = message.userId;
    this.roomId = message.roomId;
    this.content = message.content;
    this.type = message.type;
    this.metadata = message.metadata;
    this.createdAt = message.createdAt;

    if (message.user) {
      this.user = {
        id: message.user.id,
        name: message.user.name,
        username: message.user.username,
        avatar: message.user.avatar,
      };
    }

    // Include media files if present
    if (message.mediaFiles) {
      this.mediaFiles = message.mediaFiles.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        secureUrl: file.secureUrl,
        fileType: file.fileType,
        isPrimary: file.isPrimary,
      }));
    }
  }
}
