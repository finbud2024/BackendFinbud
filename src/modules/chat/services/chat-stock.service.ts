import { Injectable } from '@nestjs/common';
import { ChatStockRepository } from '../repositories/chat-stock.repository';
import { CreateChatStockDto, UpdateChatStockDto } from '../dto';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';
import { BaseService } from '../../../common/base/base.service';
import { Request } from 'express';

@Injectable()
export class ChatStockService extends BaseService<any> {
  constructor(
    private readonly chatStockRepository: ChatStockRepository,
  ) {
    super(chatStockRepository, 'ChatStock');
  }

  async create(createChatStockDto: CreateChatStockDto) {
    return this.chatStockRepository.create(createChatStockDto);
  }

  async createForUser(userId: string, createDto: Partial<CreateChatStockDto>) {
    // Validate required fields
    if (!createDto.prompt) {
      throw ExceptionFactory.chatPromptRequired();
    }
    
    const completeDto: CreateChatStockDto = {
      userId,
      prompt: createDto.prompt,
      response: createDto.response
    };
    
    return this.chatStockRepository.create(completeDto);
  }

  /**
   * Create a chat stock for the current user
   */
  async createForCurrentUser(request: Request, createDto: Partial<CreateChatStockDto>) {
    const userId = this.getUserIdFromRequest(request);
    return this.createForUser(userId, createDto);
  }

  /**
   * Find all chat stocks for a specific user
   */
  async findUserChats(userId: string, page = 1, limit = 15) {
    return this.chatStockRepository.findUserChats(userId, page, limit);
  }

  /**
   * Find all chat stocks for the current user
   */
  async findUserChatsForCurrentUser(request: Request, page = 1, limit = 15) {
    const userId = this.getUserIdFromRequest(request);
    return this.findUserChats(userId, page, limit);
  }

  /**
   * Find one chat stock by ID
   */
  async findChatStockById(id: string) {
    const chatStock = await this.chatStockRepository.findById(id);
    if (!chatStock) {
      throw ExceptionFactory.chatNotFoundSimple();
    }
    return chatStock;
  }

  async update(id: string, updateChatStockDto: UpdateChatStockDto) {
    const chatStock = await this.chatStockRepository.findById(id);
    if (!chatStock) {
      throw ExceptionFactory.chatNotFoundSimple();
    }
    
    return this.chatStockRepository.update(id, updateChatStockDto);
  }

  async remove(id: string) {
    const chatStock = await this.chatStockRepository.findById(id);
    if (!chatStock) {
      throw ExceptionFactory.chatNotFoundSimple();
    }
    
    return this.chatStockRepository.remove(id);
  }
  
  async findTodayResponse(userId: string) {
    // Use repository method for finding today's response
    const todayResponse = await this.chatStockRepository.findTodayByUserId(userId);
    
    // Return null if no response found for today
    return todayResponse;
  }

  /**
   * Find today's response for the current user
   */
  async findTodayResponseForCurrentUser(request: Request) {
    const userId = this.getUserIdFromRequest(request);
    return this.findTodayResponse(userId);
  }
} 