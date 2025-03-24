import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/base/base.repository';
import { Portfolio, PortfolioDocument } from '../entities/portfolio.entity';
import { AddPortfolioEntryDto } from '../dto/add-portfolio-entry.dto';

@Injectable()
export class PortfolioRepository extends BaseRepository<PortfolioDocument> {
  constructor(
    @InjectModel(Portfolio.name) private readonly portfolioModel: Model<PortfolioDocument>,
  ) {
    super(portfolioModel, 'Portfolio');
  }

  /**
   * Find a portfolio by user ID
   */
  async findPortfolioByUserId(userId: string): Promise<PortfolioDocument | null> {
    this.logger.debug(`Finding portfolio for user: ${userId}`);
    return this.findOne({ userId });
  }

  /**
   * Add a new entry to a portfolio's history
   */
  async addPortfolioEntry(
    userId: string, 
    entryData: AddPortfolioEntryDto
  ): Promise<PortfolioDocument | null> {
    this.logger.debug(`Adding portfolio entry for user: ${userId}`);
    
    return this.portfolioModel.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          portfolio: { 
            date: entryData.date, 
            totalValue: entryData.totalValue 
          } 
        } 
      },
      { new: true }
    ).exec();
  }

  /**
   * Get portfolio history within a date range
   */
  async getPortfolioHistory(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ date: Date; totalValue: number }[]> {
    this.logger.debug(`Getting portfolio history for user: ${userId}`);
    
    const portfolio = await this.portfolioModel.findOne(
      { userId },
      { 
        portfolio: { 
          $filter: { 
            input: '$portfolio', 
            as: 'entry', 
            cond: { 
              $and: [
                { $gte: ['$$entry.date', startDate] },
                { $lte: ['$$entry.date', endDate] }
              ]
            }
          }
        }
      }
    ).exec();
    
    return portfolio?.portfolio || [];
  }
} 