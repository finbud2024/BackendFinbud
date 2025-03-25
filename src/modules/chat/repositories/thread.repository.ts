import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Thread, ThreadDocument } from '../entities/thread.entity';
import { BaseRepository } from '../../../common/base/base.repository';

@Injectable()
export class ThreadRepository extends BaseRepository<ThreadDocument> {
  constructor(
    @InjectModel(Thread.name) private threadModel: Model<ThreadDocument>,
  ) {
    super(threadModel, 'Thread');
  }

  override async findByUserId(userId: string): Promise<ThreadDocument[]> {
    return super.findByUserId(userId);
  }

  async findThreadsByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const threads = await this.threadModel.find({ userId })
      .sort({ creationDate: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.threadModel.countDocuments({ userId }).exec();
    
    return {
      data: threads,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateTitle(id: string, title: string) {
    return this.threadModel.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    ).exec();
  }
} 