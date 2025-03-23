import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Goal, GoalDocument } from '../entities/goal.entity';
import { BaseRepository } from '../../../common/base/base.repository';

@Injectable()
export class GoalsRepository extends BaseRepository<GoalDocument> {
  constructor(
    @InjectModel(Goal.name) private readonly goalModel: Model<GoalDocument>,
  ) {
    super(goalModel, 'Goal');
  }

  /**
   * Find goals by achievement status for a user
   * @param userId User ID
   * @param isAchieved Achievement status to filter by
   * @returns Goals matching the criteria
   */
  async findByAchievementStatus(userId: string, isAchieved: boolean): Promise<GoalDocument[]> {
    this.logger.debug(`Finding ${isAchieved ? 'achieved' : 'not achieved'} goals for user ${userId}`);
    return this.findAll({ 
      userId: this.toObjectId(userId),
      isAchieved 
    });
  }

  /**
   * Find goals with approaching deadlines for a user
   * @param userId User ID
   * @param daysThreshold Number of days to consider as "approaching"
   * @returns Goals with deadlines within the threshold
   */
  async findUpcomingDeadlines(userId: string, daysThreshold: number = 30): Promise<GoalDocument[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    this.logger.debug(`Finding goals with deadlines within ${daysThreshold} days for user ${userId}`);
    return this.findAll({
      userId: this.toObjectId(userId),
      isAchieved: false,
      endDate: { $lte: thresholdDate }
    }, { sort: { endDate: 1 } });
  }
} 