import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  

  await app.register(fastifyCookie, {
    secret: 'my_cookie_secret', // Optional encryption
  });

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000', // Đổi nếu frontend chạy ở domain khác
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();