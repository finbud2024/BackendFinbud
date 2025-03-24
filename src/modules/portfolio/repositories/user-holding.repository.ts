import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/base/base.repository';
import { UserHolding, UserHoldingDocument } from '../entities/user-holding.entity';
import { UpdateStockHoldingDto } from '../dto/update-stock-holding.dto';

@Injectable()
export class UserHoldingRepository extends BaseRepository<UserHoldingDocument> {
  constructor(
    @InjectModel(UserHolding.name) private readonly userHoldingModel: Model<UserHoldingDocument>,
  ) {
    super(userHoldingModel, 'UserHolding');
  }

  /**
   * Find holdings by user ID
   */
  async findHoldingsByUserId(userId: string): Promise<UserHoldingDocument | null> {
    this.logger.debug(`Finding holdings for user: ${userId}`);
    return this.findOne({ userId });
  }

  /**
   * Update or add a stock holding for a user
   */
  async updateStockHolding(
    userId: string,
    stockSymbol: string,
    updateData: UpdateStockHoldingDto
  ): Promise<UserHoldingDocument | null> {
    this.logger.debug(`Updating stock holding for user: ${userId}, symbol: ${stockSymbol}`);
    
    // Check if the stock already exists in the user's holdings
    const holding = await this.findOne({ 
      userId, 
      'stocks.stockSymbol': stockSymbol 
    });
    
    if (holding) {
      // Update existing stock holding
      const updateFields: any = {
        'stocks.$.quantity': updateData.quantity
      };
      
      // Add optional fields if provided
      if (updateData.purchasePrice !== undefined) {
        updateFields['stocks.$.purchasePrice'] = updateData.purchasePrice;
      }
      
      return this.userHoldingModel.findOneAndUpdate(
        { userId, 'stocks.stockSymbol': stockSymbol },
        { $set: updateFields },
        { new: true }
      ).exec();
    } else {
      // Add new stock to holdings
      return this.userHoldingModel.findOneAndUpdate(
        { userId },
        { 
          $push: { 
            stocks: { 
              stockSymbol, 
              quantity: updateData.quantity, 
              purchasePrice: updateData.purchasePrice || 0 
            } 
          } 
        },
        { new: true }
      ).exec();
    }
  }

  /**
   * Remove a stock from a user's holdings
   */
  async removeStockHolding(
    userId: string,
    stockSymbol: string
  ): Promise<UserHoldingDocument | null> {
    this.logger.debug(`Removing stock holding for user: ${userId}, symbol: ${stockSymbol}`);
    
    return this.userHoldingModel.findOneAndUpdate(
      { userId },
      { $pull: { stocks: { stockSymbol } } },
      { new: true }
    ).exec();
  }

  /**
   * Calculate the total value of a user's stock holdings
   */
  async calculateTotalHoldingsValue(userId: string): Promise<number> {
    this.logger.debug(`Calculating total holdings value for user: ${userId}`);
    
    const holdings = await this.findOne({ userId });
    if (!holdings || !holdings.stocks.length) {
      return 0;
    }
    
    // Calculate the total value based on quantity and purchase price
    return holdings.stocks.reduce(
      (total, stock) => total + (stock.quantity * stock.purchasePrice), 
      0
    );
  }
} 