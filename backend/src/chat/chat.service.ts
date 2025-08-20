import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';
import { User } from '../account/user/entities/user.entity';
import { MediaService } from '../media/media.service';
import { 
  CreateRoomDto, 
  UpdateRoomDto, 
  RoomResponseDto,
  CreateMessageDto,
  MessageResponseDto 
} from './dto/chat.dto';
import { MessageType } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mediaService: MediaService,
  ) {}

  // Room Management
  async createRoom(createRoomDto: CreateRoomDto, createdBy: number): Promise<RoomResponseDto> {
    const { participantIds, ...roomData } = createRoomDto;
    
    // Validate participants exist
    const participants = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...participantIds)', { participantIds })
      .getMany();
    if (participants.length !== participantIds.length) {
      throw new BadRequestException('Some participants not found');
    }

    // Add creator to participants if not included
    if (!participantIds.includes(createdBy)) {
      participantIds.push(createdBy);
    }

    // For private rooms, check if conversation already exists
    if (roomData.isPrivate && participantIds.length === 2) {
      const existingRoom = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoin('room.participants', 'participant')
        .where('room.isPrivate = :isPrivate', { isPrivate: true })
        .andWhere('participant.id IN (:...participantIds)', { participantIds })
        .groupBy('room.id')
        .having('COUNT(participant.id) = :count', { count: participantIds.length })
        .getOne();

      if (existingRoom) {
        return this.getRoomById(existingRoom.id, createdBy);
      }
    }

    // Create room
    const room = this.roomRepository.create({
      ...roomData,
    });

    const savedRoom = await this.roomRepository.save(room);

    // Add participants
    await this.roomRepository
      .createQueryBuilder()
      .relation(Room, 'participants')
      .of(savedRoom.id)
      .add(participantIds);

    return this.getRoomById(savedRoom.id, createdBy);
  }

  async getUserRooms(userId: number, page: number = 1, limit: number = 20): Promise<RoomResponseDto[]> {
    // First, get rooms with participants
    const rooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.participants', 'participant')
      .leftJoin('room.participants', 'userCheck')
      .where('userCheck.id = :userId', { userId })
      .orderBy('room.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Then get the latest message for each room separately
    const roomsWithMessages = await Promise.all(
      rooms.map(async (room) => {
        const latestMessage = await this.messageRepository
          .createQueryBuilder('message')
          .leftJoinAndSelect('message.user', 'user')
          .where('message.roomId = :roomId', { roomId: room.id })
          .orderBy('message.createdAt', 'DESC')
          .limit(1)
          .getOne();
        
        return {
          ...room,
          messages: latestMessage ? [latestMessage] : [],
          lastMessage: latestMessage
        };
      })
    );

    // Sort rooms by latest message timestamp
    roomsWithMessages.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return roomsWithMessages.map(room => new RoomResponseDto(room, userId));
  }

  async getRoomById(roomId: number, userId: number): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants', 'messages', 'messages.user'],
      order: { messages: { createdAt: 'DESC' } }
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is participant
    const isParticipant = room.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    return new RoomResponseDto(room, userId);
  }

  async updateRoom(roomId: number, updateRoomDto: UpdateRoomDto, userId: number): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is participant and creator (for now, only creator can update)
    const isParticipant = room.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not authorized to update this room');
    }

    await this.roomRepository.update(roomId, updateRoomDto);
    
    return this.getRoomById(roomId, userId);
  }

  async deleteRoom(roomId: number, userId: number): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is creator
    const isCreator = room.participants.some(p => p.id === userId); // Anyone in the room can delete for now
    if (!isCreator) {
      throw new ForbiddenException('Only room creator can delete the room');
    }

    // Delete messages first
    await this.messageRepository.delete({ roomId });
    
    // Delete room
    await this.roomRepository.delete(roomId);
  }

  async addParticipant(roomId: number, participantId: number, userId: number): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is participant
    const isParticipant = room.participants.some(p => p.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    // Check if target user exists
    const targetUser = await this.userRepository.findOne({ where: { id: participantId } });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if target user is already participant
    const isAlreadyParticipant = room.participants.some(p => p.id === participantId);
    if (isAlreadyParticipant) {
      throw new BadRequestException('User is already a participant');
    }

    // Add participant
    await this.roomRepository
      .createQueryBuilder()
      .relation(Room, 'participants')
      .of(roomId)
      .add(participantId);

    // Create system message
    // System messages are disabled in simplified version
  }

  async removeParticipant(roomId: number, participantId: number, userId: number): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is participant and either creator or removing themselves
    const isParticipant = room.participants.some(p => p.id === userId);
    const isSelfRemoval = participantId === userId;

    if (!isParticipant && !isSelfRemoval) {
      throw new ForbiddenException('You are not authorized to remove this participant');
    }

    // Remove participant
    await this.roomRepository
      .createQueryBuilder()
      .relation(Room, 'participants')
      .of(roomId)
      .remove(participantId);

    // Create system message
    // System messages are disabled in simplified version
  }

  // Message Management
  async createMessage(createMessageDto: CreateMessageDto): Promise<MessageResponseDto> {
    // Check room access
    const hasAccess = await this.checkRoomAccess(createMessageDto.roomId, createMessageDto.userId);
    if (!hasAccess) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    // Create message
    const message = this.messageRepository.create(createMessageDto);
    const savedMessage = await this.messageRepository.save(message);

    // Update room's last activity
    // lastActivity field is removed

    // Load message with user info
    const fullMessage = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['user'],
    });

    return new MessageResponseDto(fullMessage);
  }

  async getRoomMessages(roomId: number, userId: number, page: number = 1, limit: number = 50): Promise<MessageResponseDto[]> {
    // Check room access
    const hasAccess = await this.checkRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    const messages = await this.messageRepository.find({
      where: { 
        roomId
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Load media files for messages that have media
    const messagesWithMedia = await Promise.all(
      messages.map(async (message) => {
        if (message.type === MessageType.IMAGE || message.type === MessageType.FILE) {
          const mediaFiles = await this.mediaService.getMediaFiles('chat_message', message.id);
          return { ...message, mediaFiles };
        }
        return message;
      })
    );

    return messagesWithMedia.map(message => new MessageResponseDto(message));
  }

  async editMessage(messageId: number, content: string, userId: number): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only the sender can edit their message
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // System messages cannot be edited
    // No system messages in simplified version

    await this.messageRepository.update(messageId, { 
      content 
    });

    const updatedMessage = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user'],
    });

    return new MessageResponseDto(updatedMessage);
  }

  async deleteMessage(messageId: number, userId: number): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only the sender can delete their message
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.delete({ id: messageId });

    const deletedMessage = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user'],
    });

    return new MessageResponseDto(deletedMessage);
  }

  // Message with Media
  async createMessageWithMedia(roomId: number, files: any[], content: string, userId: number): Promise<MessageResponseDto> {
    // Check room access
    const hasAccess = await this.checkRoomAccess(roomId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You are not a participant in this room');
    }

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
      }
      if (file.size > maxFileSize) {
        throw new BadRequestException(`File size exceeds 10MB limit`);
      }
    }

    // Determine message type
    const messageType = this.determineMessageType(files);
    
    // Create message
    const message = this.messageRepository.create({
      roomId,
      userId,
      content: content || this.generateMediaCaption(files),
      type: messageType,
      metadata: {
        fileCount: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0)
      }
    });

    const savedMessage = await this.messageRepository.save(message);

    try {
      // Upload files using MediaService
      const mediaFiles = await this.mediaService.uploadMediaFiles({
        entityType: 'chat_message',
        entityId: savedMessage.id,
        files: files
      });

      // Update message metadata with media info
      await this.messageRepository.update(savedMessage.id, {
        metadata: {
          ...savedMessage.metadata,
          mediaFiles: mediaFiles.map(file => ({
            id: file.id,
            fileName: file.fileName,
            secureUrl: file.secureUrl,
            fileType: file.fileType
          }))
        }
      });

      // Update room's last activity
      // lastActivity field is removed

      // Return message with media
      const messageWithMedia = await this.messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['user'],
      });

      return new MessageResponseDto({ ...messageWithMedia, mediaFiles });

    } catch (error) {
      // If upload fails, delete the message
      await this.messageRepository.delete(savedMessage.id);
      throw new BadRequestException(`Failed to upload media: ${error.message}`);
    }
  }

  // Start Private Chat
  async startPrivateChat(currentUserId: number, targetUserId: number): Promise<RoomResponseDto> {
    // Validate target user exists
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Cannot chat with yourself
    if (currentUserId === targetUserId) {
      throw new BadRequestException('Cannot start a chat with yourself');
    }

    // Check if private room already exists between these users
    const existingRoom = await this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.participants', 'p1')
      .innerJoin('room.participants', 'p2')
      .where('room.isPrivate = :isPrivate', { isPrivate: true })
      .andWhere('p1.id = :user1 AND p2.id = :user2', { 
        user1: currentUserId, 
        user2: targetUserId 
      })
      .orWhere('p1.id = :user2 AND p2.id = :user1', { 
        user1: currentUserId, 
        user2: targetUserId 
      })
      .getOne();

    if (existingRoom) {
      return this.getRoomById(existingRoom.id, currentUserId);
    }

    // Create new private room
    const createRoomDto: CreateRoomDto = {
      name: 'Private Chat',
      isPrivate: true,
      participantIds: [targetUserId],
    };

    return this.createRoom(createRoomDto, currentUserId);
  }

  // Helper Methods
  async checkRoomAccess(roomId: number, userId: number): Promise<boolean> {
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.participants', 'participant')
      .where('room.id = :roomId', { roomId })
      .andWhere('participant.id = :userId', { userId })
      .getOne();

    return !!room;
  }

  private determineMessageType(files: any[]): MessageType {
    if (files.length === 0) return MessageType.TEXT;
    
    const hasImage = files.some(file => file.mimetype.startsWith('image/'));
    
    if (hasImage) return MessageType.IMAGE;
    
    return MessageType.FILE;
  }

  private generateMediaCaption(files: any[]): string {
    if (files.length === 1) {
      const file = files[0];
      if (file.mimetype.startsWith('image/')) {
        return '📸 Sent an image';
      }
      if (file.mimetype.startsWith('video/')) {
        return '🎥 Sent a video';
      }
      return `📎 Sent a file: ${file.originalname}`;
    }
    
    const imageCount = files.filter(f => f.mimetype.startsWith('image/')).length;
    const videoCount = files.filter(f => f.mimetype.startsWith('video/')).length;
    const otherCount = files.length - imageCount - videoCount;
    
    let caption = '📁 Sent files: ';
    const parts: string[] = [];
    
    if (imageCount > 0) parts.push(`${imageCount} image${imageCount > 1 ? 's' : ''}`);
    if (videoCount > 0) parts.push(`${videoCount} video${videoCount > 1 ? 's' : ''}`);
    if (otherCount > 0) parts.push(`${otherCount} other file${otherCount > 1 ? 's' : ''}`);
    
    return caption + parts.join(', ');
  }
}
