import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';
import { User } from '../account/user/entities/user.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Message, User]),
    MediaModule, // Import MediaModule để sử dụng MediaService
    JwtModule, // Import JwtModule để sử dụng JwtService trong Gateway
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
