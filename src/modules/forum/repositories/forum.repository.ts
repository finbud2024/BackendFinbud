import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Forum } from '../entities/forum.entity';
import { BaseRepository } from '../../../common/base/base.repository'; 

@Injectable()
export class ForumRepository extends BaseRepository<Forum> {
  constructor(
    @InjectModel(Forum.name) private readonly forumModel: Model<Forum>,
  ) {
    super(forumModel, 'Forum');
  }
}
