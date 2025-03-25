import { Injectable } from '@nestjs/common';
import { ThreadRepository } from '../repositories/thread.repository';
import { ChatRepository } from '../repositories/chat.repository';
import { CreateThreadDto, UpdateThreadDto } from '../dto';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';
import { BaseService } from '../../../common/base/base.service';
import { Request } from 'express';

@Injectable()
export class ThreadService extends BaseService<any> {
  constructor(
    private readonly threadRepository: ThreadRepository,
    private readonly chatRepository: ChatRepository,
  ) {
    super(threadRepository, 'Thread');
  }

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

  /**
   * Create a thread for the user identified in the request
   */
  async createForCurrentUser(request: Request, createDto: Partial<CreateThreadDto>) {
    const userId = this.getUserIdFromRequest(request);
    return this.createForUser(userId, createDto);
  }

  /**
   * Find all threads for a specific user
   */
  async findThreadsByUser(userId: string, page = 1, limit = 10) {
    return this.threadRepository.findThreadsByUser(userId, page, limit);
  }

  /**
   * Find all threads for the user in the request
   */
  async findAllForCurrentUser(request: Request, page = 1, limit = 10) {
    const userId = this.getUserIdFromRequest(request);
    return this.findThreadsByUser(userId, page, limit);
  }

  async findAllThreads() {
    return this.threadRepository.findAll();
  }

  /**
   * Find a specific thread by ID
   */
  async findThreadById(id: string) {
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