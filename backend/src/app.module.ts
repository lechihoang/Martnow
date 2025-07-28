import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // thay bằng user của bạn
      password: 'password', // thay bằng password của bạn
      database: 'your_db_name', // thay bằng tên database
      autoLoadEntities: true,
      synchronize: true, // chỉ dùng cho dev, không nên dùng cho production
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
