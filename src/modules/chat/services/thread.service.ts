import { Injectable } from '@nestjs/common';
import { ThreadRepository } from '../repositories/thread.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { CreateThreadDto, UpdateThreadDto } from '../dto';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';

@Injectable()
export class ThreadService {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly chatRepository: ChatRepository,
  ) {}

  async create(createThreadDto: CreateThreadDto) {
    return this.threadRepository.create(createThreadDto);
  }

  async createForUser(userId: string, createDto: Partial<CreateThreadDto>) {
    const completeDto: CreateThreadDto = {
      userId,
      title: createDto.title
    };
    
    return this.threadRepository.create(completeDto);
  }

  async findAll(userId: string, page = 1, limit = 10) {
    return this.threadRepository.findThreadsByUser(userId, page, limit);
  }

  async findAllThreads() {
    return this.threadRepository.findAll();
  }

  async findOne(id: string) {
    const thread = await this.threadRepository.findById(id);
    if (!thread) {
      throw ExceptionFactory.threadNotFoundSimple();
    }
    return thread;
  }

  async update(id: string, updateThreadDto: UpdateThreadDto) {
    const thread = await this.threadRepository.findById(id);
    if (!thread) {
      throw ExceptionFactory.threadNotFoundSimple();
    }
    
    if (updateThreadDto.title) {
      return this.threadRepository.updateTitle(id, updateThreadDto.title);
    }
    
    return thread;
  }

  async remove(id: string) {
    const thread = await this.threadRepository.findById(id);
    if (!thread) {
      throw ExceptionFactory.threadNotFoundSimple();
    }
    
    // Delete all chats in this thread
    await this.chatRepository.deleteByThreadId(id);
    
    // Delete the thread
    return this.threadRepository.remove(id);
  }

  async removeAll() {
    // First delete all chats
    await this.chatRepository.removeMany({});
    
    // Then delete all threads
    return this.threadRepository.removeMany({});
  }

  async removeAllByUser(userId: string) {
    // Find all threads for this user
    const threads = await this.threadRepository.findByUserId(userId);
    
    // Delete all chats for each thread
    for (const thread of threads) {
      await this.chatRepository.deleteByThreadId(thread.id);
    }
    
    // Delete all threads for this user
    return this.threadRepository.removeMany({ userId });
  }
} 