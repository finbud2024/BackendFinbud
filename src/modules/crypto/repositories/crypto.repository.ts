import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/base/base.repository';
import { Crypto, CryptoDocument } from '../entities/crypto.entity';

@Injectable()
export class CryptoRepository extends BaseRepository<CryptoDocument> {
  constructor(
    @InjectModel(Crypto.name) private readonly cryptoModel: Model<CryptoDocument>,
  ) {
    super(cryptoModel, 'Crypto');
  }

  /**
   * Find crypto data by symbol and date range
   * @param symbol Cryptocurrency symbol
   * @param startDate Start date range
   * @param endDate End date range
   * @returns Crypto documents matching criteria
   */
  async findBySymbolAndDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CryptoDocument[]> {
    this.logger.debug(`Finding crypto data for symbol: ${symbol} between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    // Ensure we're using the beginning and end of the days for inclusive range
    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    this.logger.debug(`Adjusted date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    // First, let's confirm data exists for this symbol
    const count = await this.model.countDocuments({ symbol }).exec();
    this.logger.debug(`Total documents for symbol ${symbol}: ${count}`);
    
    return this.findAll({
      symbol,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }, { sort: { date: -1 } });
  }

  /**
   * Get the latest entry for a specific cryptocurrency
   * @param symbol Cryptocurrency symbol (optional)
   * @returns Latest crypto document
   */
  async getLatestEntry(symbol?: string): Promise<CryptoDocument | null> {
    const filter = symbol ? { symbol } : {};
    this.logger.debug(`Finding latest crypto entry${symbol ? ` for ${symbol}` : ''}`);
    
    return this.cryptoModel.findOne(filter).sort({ date: -1 }).exec();
  }
} 