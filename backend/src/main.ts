import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
