import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use cookie parser middleware
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser() as never);

  // Enable CORS for frontend with cookie support
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [];

  app.enableCors({
    origin: corsOrigins,
    credentials: true, // Required for HTTP-only cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.listen(3001);
}
void bootstrap();
