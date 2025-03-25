import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatStock, ChatStockDocument } from '../entities/chat-stock.entity';
import { BaseRepository } from '../../../common/base/base.repository';

@Injectable()
export class ChatStockRepository extends BaseRepository<ChatStockDocument> {
  constructor(
    @InjectModel(ChatStock.name) private chatStockModel: Model<ChatStockDocument>,
  ) {
    super(chatStockModel, 'ChatStock');
  }

  override async findByUserId(userId: string): Promise<ChatStockDocument[]> {
    return super.findByUserId(userId);
  }

  async findUserChats(userId: string, page = 1, limit = 15): Promise<{
    data: ChatStockDocument[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const skip = (page - 1) * limit;
    
    const chats = await this.chatStockModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.chatStockModel.countDocuments({ userId }).exec();
    
    return {
      data: chats,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findTodayByUserId(userId: string): Promise<ChatStockDocument | null> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.chatStockModel
      .findOne({ 
        userId, 
        createdAt: { $gte: startOfDay, $lte: endOfDay } 
      })
      .sort({ createdAt: -1 })
      .exec();
  }
} 