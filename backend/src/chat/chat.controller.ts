import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Room Management Endpoints

  @Post('rooms')
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    return this.chatService.createRoom(createRoomDto, req.user.id);
  }

  @Get('rooms')
  async getUserRooms(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.chatService.getUserRooms(req.user.id, page, limit);
  }

  @Get('rooms/:id')
  async getRoomById(@Param('id', ParseIntPipe) roomId: number, @Request() req) {
    return this.chatService.getRoomById(roomId, req.user.id);
  }

  @Put('rooms/:id')
  async updateRoom(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Request() req,
  ) {
    return this.chatService.updateRoom(roomId, updateRoomDto, req.user.id);
  }

  @Delete('rooms/:id')
  async deleteRoom(@Param('id', ParseIntPipe) roomId: number, @Request() req) {
    await this.chatService.deleteRoom(roomId, req.user.id);
    return { message: 'Room deleted successfully' };
  }

  @Post('rooms/:id/participants/:userId')
  async addParticipant(
    @Param('id', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) participantId: number,
    @Request() req,
  ) {
    await this.chatService.addParticipant(roomId, participantId, req.user.id);
    return { message: 'Participant added successfully' };
  }

  @Delete('rooms/:id/participants/:userId')
  async removeParticipant(
    @Param('id', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) participantId: number,
    @Request() req,
  ) {
    await this.chatService.removeParticipant(
      roomId,
      participantId,
      req.user.id,
    );
    return { message: 'Participant removed successfully' };
  }

  // Message Management Endpoints

  @Post('messages')
  async createMessage(
    @Body() data: { roomId: number; content: string },
    @Request() req,
  ) {
    return this.chatService.createMessage({
      roomId: data.roomId,
      userId: req.user.id,
      content: data.content,
    });
  }

  @Get('rooms/:id/messages')
  async getRoomMessages(
    @Param('id', ParseIntPipe) roomId: number,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.chatService.getRoomMessages(roomId, req.user.id, page, limit);
  }

  @Post('messages/media')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async sendMessageWithMedia(
    @UploadedFiles() files: any[],
    @Body() data: { roomId: string; content?: string },
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const roomId = parseInt(data.roomId);

    return this.chatService.createMessageWithMedia(
      roomId,
      files,
      data.content || '',
      req.user.id,
    );
  }

  @Post('messages/quick-image')
  @UseInterceptors(FilesInterceptor('files', 1)) // Single image
  async sendQuickImage(
    @UploadedFiles() files: any[],
    @Body() data: { roomId: string },
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image provided');
    }

    const roomId = parseInt(data.roomId);

    return this.chatService.createMessageWithMedia(
      roomId,
      files,
      '', // No text content
      req.user.id,
    );
  }

  // Start a private chat with another user
  @Post('private')
  async startPrivateChat(@Body() data: { userId: number }, @Request() req) {
    return this.chatService.startPrivateChat(req.user.id, data.userId);
  }

  // Get all users for chat (excluding current user)
  @Get('users')
  async getAvailableUsers(@Request() req) {
    // This would typically come from a UserService
    // For now, this is a placeholder
    return { message: 'Implement user listing in UserService' };
  }

  // Check room access (utility endpoint)
  @Get('rooms/:id/access')
  async checkRoomAccess(
    @Param('id', ParseIntPipe) roomId: number,
    @Request() req,
  ) {
    const hasAccess = await this.chatService.checkRoomAccess(
      roomId,
      req.user.id,
    );
    return { hasAccess };
  }
}
