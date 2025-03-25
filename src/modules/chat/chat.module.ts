import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Entities
import { Thread, ThreadSchema } from './entities/thread.entity';
import { Chat, ChatSchema } from './entities/chat.entity';
import { ChatStock, ChatStockSchema } from './entities/chat-stock.entity';

// Repositories
import { 
  ThreadRepository, 
  ChatRepository, 
  ChatStockRepository 
} from './repositories';

// Services
import { 
  ThreadService, 
  ChatService, 
  ChatStockService,
  AiService 
} from './services';

// Controllers
import { 
  ThreadController, 
  ChatController, 
  ChatStockController
} from './controllers';

@Module({
  imports: [
    // Database
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: ChatStock.name, schema: ChatStockSchema },
    ]),
    
    // External modules
    PassportModule,  // For authentication
    ConfigModule,    // For environment variables
    HttpModule,      // For external API calls
  ],
  controllers: [
    ThreadController,
    ChatController,
    ChatStockController,
  ],
  providers: [
    // Repositories
    ThreadRepository,
    ChatRepository,
    ChatStockRepository,
    
    // Services
    ThreadService,
    ChatService,
    ChatStockService,
    AiService,
  ],
  exports: [
    // Export services for use in other modules
    ThreadService,
    ChatService,
    ChatStockService,
    AiService,
  ],
})
export class ChatModule {} 