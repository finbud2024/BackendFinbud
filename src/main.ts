import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import mongoose from 'mongoose';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Test database connection
  const mongoUri = configService.get<string>('MONGODB_URI');
  if (mongoUri) {
    try {
      // Just log that we'll be connecting, but don't connect directly here
      // Let MongooseModule handle the connection
      console.log('🔌 Will connect to MongoDB at:', mongoUri.split('@')[1]);
    } catch (error) {
      console.error('❌ Error parsing MongoDB URI:', error.message);
    }
  } else {
    console.error('❌ MongoDB URI not defined in environment variables');
  }

  // Configure WebSockets
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS
  app.enableCors({
    origin: '*', // In production, you should restrict this to your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have validation decorators
      transform: true, // Automatically transform payloads
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Prefixing all routes with /api
  app.setGlobalPrefix('api');

  // Get port from env variable or use default
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`✅ Application is running on: ${await app.getUrl()}`);
  console.log(`💾 Database connection is maintained through mongoose module`);
  console.log(`🔌 WebSockets are enabled and listening for connections`);
}
bootstrap();
