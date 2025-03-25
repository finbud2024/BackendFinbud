import { Injectable } from '@nestjs/common';
import { ChatStockRepository } from '../repositories/chat-stock.repository';
import { CreateChatStockDto, UpdateChatStockDto } from '../dto';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';

@Injectable()
export class ChatStockService {
  constructor(
    private readonly chatStockRepository: ChatStockRepository,
  ) {}

  async create(createChatStockDto: CreateChatStockDto) {
    return this.chatStockRepository.create(createChatStockDto);
  }

  async findAll(userId: string, page = 1, limit = 15) {
    return this.chatStockRepository.findUserChats(userId, page, limit);
  }

  async findOne(id: string) {
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
} 