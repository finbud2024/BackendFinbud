import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository';
import { ThreadRepository } from '../repositories/thread.repository';
import { CreateChatDto, UpdateChatDto } from '../dto';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly threadRepository: ThreadRepository,
  ) {}

  async create(createChatDto: CreateChatDto) {
    // Check if the thread exists
    const thread = await this.threadRepository.findById(createChatDto.threadId);
    if (!thread) {
      throw ExceptionFactory.threadNotFoundSimple();
    }
    
    return this.chatRepository.create(createChatDto);
  }

  async findAll() {
    return this.chatRepository.findAll();
  }

  async findByThreadId(threadId: string) {
    // Check if the thread exists
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw ExceptionFactory.threadNotFoundSimple();
    }
    
    return this.chatRepository.findByThreadId(threadId);
  }

  async findOne(id: string) {
    const chat = await this.chatRepository.findById(id);
    if (!chat) {
      throw ExceptionFactory.chatNotFoundSimple();
    }
    return chat;
  }

  async update(id: string, updateChatDto: UpdateChatDto) {
    const chat = await this.chatRepository.findById(id);
    if (!chat) {
      throw ExceptionFactory.chatNotFoundSimple();
    }
    
    return this.chatRepository.update(id, updateChatDto);
  }

  async remove(id: string) {
    const chat = await this.chatRepository.findById(id);
    if (!chat) {
      throw ExceptionFactory.chatNotFoundSimple();
    }
    
    return this.chatRepository.remove(id);
  }
  
  async removeAll() {
    return this.chatRepository.removeMany({});
  }
  
  async removeByThreadId(threadId: string) {
    // Check if the thread exists
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw ExceptionFactory.threadNotFoundSimple();
    }
    
    return this.chatRepository.deleteByThreadId(threadId);
  }
} 