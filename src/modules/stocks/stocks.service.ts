import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { StocksRepository } from './repositories/stocks.repository';
import { StockDocument } from './entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StocksService extends BaseService<StockDocument> {
  protected readonly logger = new Logger(StocksService.name);

  constructor(
    protected readonly stocksRepository: StocksRepository,
    @InjectModel(Stock.name) private readonly stockModel: Model<Stock>
  ) {
    super(stocksRepository, 'Stock');
  }

  /**
   * Find all stocks for a specific symbol
   * @param symbol Stock symbol
   * @returns Array of stock data for the symbol
   */
  async findBySymbol(symbol: string): Promise<StockDocument[]> {
    this.logger.log(`Finding all stock data for symbol: ${symbol}`);
    return this.findAll({ symbol }, { sort: { date: -1 } });
  }

  /**
   * Get the latest stock price for a symbol
   * @param symbol Stock symbol
   * @returns The latest stock data or null if not found
   */
  async getLatestPrice(symbol: string): Promise<StockDocument> {
    this.logger.log(`Getting latest price for symbol: ${symbol}`);
    const stock = await this.stocksRepository.findLatestBySymbol(symbol);
    
    if (!stock) {
      this.logger.warn(`No stock data found for symbol: ${symbol}`);
      throw new NotFoundException(`No stock data found for symbol: ${symbol}`);
    }
    
    return stock;
  }

  /**
   * Get historical stock data for a symbol within a date range
   * @param symbol Stock symbol
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of stock data
   */
  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockDocument[]> {
    this.logger.log(`Getting historical data for ${symbol} from ${startDate} to ${endDate}`);
    
    const stocks = await this.stocksRepository.findBySymbolAndDateRange(
      symbol,
      startDate,
      endDate
    );
    
    if (!stocks.length) {
      this.logger.warn(`No historical data found for ${symbol} in the specified date range`);
    }
    
    return stocks;
  }

  /**
   * Get a list of all available stock symbols
   * @returns Array of unique stock symbols
   */
  async getAvailableSymbols(): Promise<string[]> {
    this.logger.log('Getting list of available stock symbols');
    return this.stocksRepository.getUniqueSymbols();
  }

  /**
   * Create a new stock entry
   * @param createStockDto Stock data
   * @returns The created stock document
   */
  async create(createStockDto: CreateStockDto): Promise<StockDocument> {
    this.logger.log(`Creating stock entry: ${JSON.stringify(createStockDto)}`);
    
    const createdStock = new this.stockModel(createStockDto);
    return createdStock.save();
  }

  /**
   * Update a stock entry
   * @param id Stock document ID
   * @param updateStockDto Updated stock data
   * @returns The updated stock document
   */
  async update(id: string, updateStockDto: UpdateStockDto): Promise<StockDocument> {
    this.logger.log(`Updating stock entry with ID: ${id}`);
    
    try {
      // Find the stock first to ensure it exists
      const stock = await this.findById(id);
      
      // If symbol and date are being updated, check for duplicates
      if (updateStockDto.symbol && updateStockDto.date) {
        const existingStock = await this.findOne({
          symbol: updateStockDto.symbol,
          date: updateStockDto.date,
          _id: { $ne: id } // Exclude the current document
        });
        
        if (existingStock) {
          this.logger.warn(`Stock data already exists for ${updateStockDto.symbol} on ${updateStockDto.date}`);
          throw new ConflictException(
            `Stock data already exists for ${updateStockDto.symbol} on ${updateStockDto.date}`
          );
        }
      }
      
      return super.update(id, updateStockDto);
    } catch (error) {
      this.logger.error(`Error updating stock entry: ${error.message}`);
      // Rethrow if it's already a NestJS exception
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update stock entry: ${error.message}`);
    }
  }

  async updateStockBatch(symbol: string, data: any[]): Promise<{ saved: number, skipped: number }> {
    this.logger.log(`Processing batch update for ${symbol} with ${data.length} entries`);
    
    let saved = 0;
    let skipped = 0;
    
    // Process each data entry
    for (const entry of data) {
      try {
        // Check if we already have this stock data point by symbol and date
        const existingEntry = await this.stockModel.findOne({
          symbol,
          date: new Date(entry.date)
        });
        
        if (existingEntry) {
          this.logger.debug(`Entry for ${symbol} on ${entry.date} already exists, skipping`);
          skipped++;
          continue;
        }
        
        // Create new stock entry
        const stockData = {
          symbol,
          open: entry.open,
          high: entry.high,
          low: entry.low,
          close: entry.close,
          volume: entry.volume,
          change: entry.change || (entry.close - entry.open),
          date: new Date(entry.date)
        };
        
        await this.create(stockData);
        saved++;
      } catch (error) {
        this.logger.error(`Error processing entry for ${symbol}: ${error.message}`);
        skipped++;
      }
    }
    
    return { saved, skipped };
  }

  async findAll(filter = {}, options = {}): Promise<StockDocument[]> {
    return this.stockModel.find(filter, {}, options).exec();
  }

  async findById(id: string): Promise<StockDocument> {
    const stock = await this.stockModel.findById(id).exec();
    
    if (!stock) {
      throw new NotFoundException(`Stock with ID "${id}" not found`);
    }
    
    return stock;
  }

  async getLatestEntry(): Promise<{ date: Date | null }> {
    const latestStock = await this.stockModel
      .findOne({})
      .sort({ date: -1 })
      .exec();
    
    if (!latestStock) {
      return { date: null };
    }
    
    return { date: latestStock.date };
  }

  async remove(id: string): Promise<StockDocument> {
    const stock = await this.findById(id);
    
    const result = await this.stockModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Stock with ID "${id}" not found`);
    }
    
    return stock;
  }
} 