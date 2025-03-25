import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from '../entities/chat.entity';
import { BaseRepository } from '../../../common/base/base.repository';

@Injectable()
export class ChatRepository extends BaseRepository<ChatDocument> {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) {
    super(chatModel, 'Chat');
  }

  async findByThreadId(threadId: string): Promise<ChatDocument[]> {
    return this.chatModel
      .find({ threadId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findLastByThreadId(threadId: string, limit = 10): Promise<ChatDocument[]> {
    return this.chatModel
      .find({ threadId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async deleteByThreadId(threadId: string): Promise<void> {
    await this.chatModel.deleteMany({ threadId }).exec();
  }
} 