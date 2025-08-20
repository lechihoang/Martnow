import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string[]>(); // userId -> socketIds[]

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  // Handle client connection
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Get token from handshake auth or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      if (!userId) {
        client.disconnect();
        return;
      }

      client.userId = userId;
      client.user = payload;

      // Track user connection
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }
      this.connectedUsers.get(userId)!.push(client.id);

      console.log(`User ${userId} connected with socket ${client.id}`);
      
      // Notify others that user is online
      client.broadcast.emit('userOnline', { userId, username: payload.username });

      // Join user to their rooms
      const userRooms = await this.chatService.getUserRooms(userId);
      userRooms.forEach(room => {
        client.join(`room_${room.id}`);
      });

    } catch (error) {
      console.error('Connection authentication failed:', error);
      client.disconnect();
    }
  }

  // Handle client disconnection
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userId = client.userId;
      const socketIds = this.connectedUsers.get(userId);
      
      if (socketIds) {
        const index = socketIds.indexOf(client.id);
        if (index !== -1) {
          socketIds.splice(index, 1);
          
          // If no more connections for this user, mark as offline
          if (socketIds.length === 0) {
            this.connectedUsers.delete(userId);
            client.broadcast.emit('userOffline', { userId });
          }
        }
      }

      console.log(`User ${userId} disconnected`);
    }
  }

  // Join a room
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { roomId } = data;
      const userId = client.userId;

      if (!userId) return;

      // Check if user has access to this room
      const hasAccess = await this.chatService.checkRoomAccess(roomId, userId);
      
      if (!hasAccess) {
        client.emit('error', { message: 'Access denied to this room' });
        return;
      }

      // Join the socket to the room
      client.join(`room_${roomId}`);
      
      // Load recent messages for this room
      const messages = await this.chatService.getRoomMessages(roomId, userId, 1, 50);
      
      client.emit('joinedRoom', { 
        roomId, 
        messages 
      });

      // Notify others in the room that user joined
      client.to(`room_${roomId}`).emit('userJoinedRoom', {
        userId,
        username: client.user.username,
        roomId,
      });

    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Leave a room
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { roomId } = data;
    
    client.leave(`room_${roomId}`);
    
    // Notify others in the room that user left
    client.to(`room_${roomId}`).emit('userLeftRoom', {
      userId: client.userId,
      username: client.user.username,
      roomId,
    });
  }

  // Send a message
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: number; content: string; type?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { roomId, content, type = 'text' } = data;
      const userId = client.userId;

      if (!userId) return;

      // Create the message
      const message = await this.chatService.createMessage({
        roomId,
        userId,
        content,
        type: type as any,
      });

      // Broadcast to all users in the room
      this.server.to(`room_${roomId}`).emit('newMessage', message);

      // Return confirmation to sender
      return { success: true, message };

    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  // Handle typing indicator
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: number; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { roomId, isTyping } = data;
    
    // Broadcast typing status to others in the room (excluding sender)
    client.to(`room_${roomId}`).emit('userTyping', {
      userId: client.userId,
      username: client.user.username,
      isTyping,
      roomId,
    });
  }

  // Edit message
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() data: { messageId: number; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { messageId, content } = data;
      const userId = client.userId;

      if (!userId) return;

      const updatedMessage = await this.chatService.editMessage(messageId, content, userId);

      // Broadcast to all users in the room
      this.server.to(`room_${updatedMessage.roomId}`).emit('messageEdited', updatedMessage);

      return { success: true, message: updatedMessage };

    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  // Delete message
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { messageId } = data;
      const userId = client.userId;

      if (!userId) return;

      const deletedMessage = await this.chatService.deleteMessage(messageId, userId);

      // Broadcast to all users in the room
      this.server.to(`room_${deletedMessage.roomId}`).emit('messageDeleted', { 
        messageId,
        roomId: deletedMessage.roomId 
      });

      return { success: true };

    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  // Get online users
  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUserIds = Array.from(this.connectedUsers.keys());
    client.emit('onlineUsers', onlineUserIds);
  }
}
