import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../../common/base/base.service';
import { ForumRepository } from '../repositories/forum.repository';
import { CreateForumDto } from '../dto/create-forum.dto';
import { Forum } from '../entities/forum.entity';

@Injectable()
export class ForumService extends BaseService<Forum> {
  constructor(private readonly forumRepository: ForumRepository) {
    super(forumRepository, 'Forum');
  }

  async initDefaultForums(): Promise<{ message: string }> {
    const forumsExist = await this.repository.count();
    if (forumsExist > 0) {
      return { message: 'Forums already initialized' };
    }

    const defaultForums: CreateForumDto[] = [
      { name: 'General', slug: 'p/general', description: 'General financial discussions', logo: 'Globe' },
      { name: 'Investing', slug: 'p/investing', description: 'Stock market and investment strategies', logo: 'TrendingUp' },
      { name: 'Crypto', slug: 'p/crypto', description: 'Cryptocurrency and blockchain', logo: 'Bitcoin' },
      { name: 'Economy', slug: 'p/economy', description: 'Macroeconomics and financial news', logo: 'ChartNoAxesCombined' },
      { name: 'Personal Finance', slug: 'p/personal-finance', description: 'Budgeting and saving tips', logo: 'HandCoins' },
      { name: 'Real Estate', slug: 'p/real-estate', description: 'Housing and mortgage discussions', logo: 'House' },
      { name: 'Fintech', slug: 'p/fintech', description: 'Financial technology innovations', logo: 'WalletCards' },
      { name: 'AMA', slug: 'p/ama', description: 'Ask Me Anything with experts', logo: 'CircleHelp' },
      { name: 'Self Promotions', slug: 'p/self-promotions', description: 'Share your projects and blogs', logo: 'Store' },
      { name: 'Memes', slug: 'p/memes', description: 'Finance-related humor', logo: 'Laugh' },
      { name: 'Education', slug: 'p/education', description: 'Learning resources and literacy', logo: 'BookOpen' },
    ];

    await this.repository.createMany(defaultForums);
    return { message: 'Forums initialized successfully' };
  }
}
