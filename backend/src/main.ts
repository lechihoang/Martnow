import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Use cookie parser middleware
  app.use(cookieParser());

  // Enable CORS for frontend with cookie support
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Support multiple origins
    credentials: true, // Required for HTTP-only cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.listen(3001);
}
bootstrap();
