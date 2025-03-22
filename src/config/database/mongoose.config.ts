import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  return {
    uri: configService.get<string>('MONGODB_URI'),
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryAttempts: 3,
    retryDelay: 500,
  };
}; 