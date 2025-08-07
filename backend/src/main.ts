import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use cookie parser middleware
  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000', // Đổi nếu frontend chạy ở domain khác
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();