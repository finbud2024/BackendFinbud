import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from '../entities/stock.entity';
import { BaseRepository } from '../../../common/base/base.repository';

@Injectable()
export class StocksRepository extends BaseRepository<StockDocument> {
  constructor(
    @InjectModel(Stock.name) private readonly stockModel: Model<StockDocument>,
  ) {
    super(stockModel, 'Stock');
  }

  /**
   * Find the latest stock price for a symbol
   * @param symbol Stock symbol
   * @returns The latest stock data
   */
  async findLatestBySymbol(symbol: string): Promise<StockDocument | null> {
    this.logger.debug(`Finding latest stock data for symbol: ${symbol}`);
    return this.findOne(
      { symbol },
      { sort: { date: -1 } }
    );
  }

  /**
   * Find stock data for a symbol within a date range
   * @param symbol Stock symbol
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of stock data
   */
  async findBySymbolAndDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockDocument[]> {
    this.logger.debug(`Finding stock data for ${symbol} between ${startDate} and ${endDate}`);
    return this.findAll(
      { 
        symbol,
        date: { 
          $gte: startDate,
          $lte: endDate
        }
      },
      { sort: { date: 1 } } // Sort by date ascending
    );
  }

  /**
   * Get unique stock symbols in the database
   * @returns Array of unique stock symbols
   */
  async getUniqueSymbols(): Promise<string[]> {
    this.logger.debug('Getting unique stock symbols');
    const result = await this.aggregate([
      { $group: { _id: '$symbol' } },
      { $sort: { _id: 1 } }
    ]);
    
    return result.map(item => item._id);
  }
} 