import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { CryptoRepository } from './repositories/crypto.repository';
import { Crypto, CryptoDocument } from './entities/crypto.entity';
import { CreateCryptoDto } from './dto/create-crypto.dto';
import { QueryCryptoDto } from './dto/query-crypto.dto';
import moment from 'moment';
import { MongoError } from 'mongodb';
import { AppException, ExceptionFactory } from '../../common/exceptions/app.exception';

@Injectable()
export class CryptoService extends BaseService<CryptoDocument> {
  constructor(private readonly cryptoRepository: CryptoRepository) {
    super(cryptoRepository, 'Crypto');
  }

  /**
   * Find crypto data by symbol(s) and date range
   * @param queryDto Query parameters containing symbol(s) and date range
   * @returns Array of crypto documents
   */
  async findBySymbolAndDateRange(queryDto: QueryCryptoDto): Promise<Crypto[]> {
    const { symbol, symbols, startDate, endDate } = queryDto;
    
    // Use date range method with provided dates or defaults
    const dateRange = this.getDateRange(startDate, endDate);
    
    // Handle single symbol case
    if (symbol) {
      this.logger.debug(`Searching for ${symbol} from ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`);
      return this.cryptoRepository.findBySymbolAndDateRange(symbol, dateRange.startDate, dateRange.endDate);
    }
    
    // Handle multiple symbols case
    if (symbols && symbols.length > 0) {
      this.logger.debug(`Searching for multiple symbols: [${symbols.join(', ')}] from ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`);
      
      // Use Promise.all to fetch data for all symbols in parallel
      const results = await Promise.all(
        symbols.map(sym => this.cryptoRepository.findBySymbolAndDateRange(sym, dateRange.startDate, dateRange.endDate))
      );
      
      // Flatten the results array
      return results.flat();
    }
    
    // No symbols provided
    this.logger.debug('No symbol(s) provided for search');
    return [];
  }

  /**
   * Get the latest entry in the database for a single symbol
   * @param symbol Cryptocurrency symbol
   * @returns The latest crypto document or null
   */
  async getLatestEntry(symbol?: string): Promise<Crypto | null> {
    // Simply return the repository result, which will be null if no document is found
    return this.cryptoRepository.getLatestEntry(symbol);
  }

  /**
   * Get the latest entries for multiple symbols
   * @param symbols Array of cryptocurrency symbols
   * @returns Array of latest crypto documents
   */
  async getLatestEntries(symbols: string[]): Promise<Crypto[]> {
    // Use Promise.all to fetch latest entries for each symbol in parallel
    const latestEntries = await Promise.all(
      symbols.map(symbol => this.cryptoRepository.getLatestEntry(symbol))
    );
    
    // Filter out null results
    return latestEntries.filter(entry => entry !== null) as Crypto[];
  }

  /**
   * Create multiple entities with duplicate handling
   * @param createDtos Array of entity data
   * @returns Result with successfully created entities and skipped entries count
   */
  async createManyWithDuplicateHandling(createDtos: CreateCryptoDto[]): Promise<{ savedEntries: CryptoDocument[]; skippedCount: number }> {
    this.logger.debug(`Creating ${createDtos.length} ${this.entityName} entities with duplicate handling`);
    
    if (!createDtos || createDtos.length === 0) {
      throw ExceptionFactory.cryptoInvalidData('No data provided for batch creation');
    }
    
    const savedEntries: CryptoDocument[] = [];
    let skippedCount = 0;
    
    // Process each entry individually to handle duplicates
    for (const dto of createDtos) {
      try {
        // Validate required fields
        if (!dto.symbol) {
          throw ExceptionFactory.cryptoSymbolRequired();
        }
        
        if (!dto.date) {
          throw ExceptionFactory.cryptoDateRequired();
        }
        
        // Check if entry already exists
        const existing = await this.cryptoRepository.findOne({
          symbol: dto.symbol,
          date: new Date(dto.date)
        });
        
        if (existing) {
          this.logger.debug(`Skipping duplicate entry for ${dto.symbol} on ${dto.date}`);
          skippedCount++;
          continue;
        }
        
        // Create new entry
        const saved = await this.create(dto);
        savedEntries.push(saved);
        
      } catch (error) {
        if (error instanceof MongoError && error.code === 11000) {
          // Duplicate key error
          this.logger.debug(`Skipping duplicate entry for ${dto.symbol}`);
          skippedCount++;
        } else if (error instanceof AppException) {
          // Rethrow our custom exceptions
          throw error;
        } else {
          // Convert other errors to our custom exception
          throw ExceptionFactory.cryptoCreateFailed(
            `Failed to create entry for ${dto.symbol}: ${error.message}`
          );
        }
      }
    }
    
    return { 
      savedEntries, 
      skippedCount 
    };
  }

  /**
   * Process and save cryptocurrency data from API responses
   * @param cryptoResponses Array of cryptocurrency API responses
   * @returns Success status
   */
  async updateCryptoDatabase(cryptoResponses: any[]): Promise<{ success: boolean; count: number }> {
    try {
      if (!cryptoResponses || cryptoResponses.length === 0) {
        throw ExceptionFactory.cryptoInvalidData('No cryptocurrency responses provided');
      }
      
      this.logger.debug(`Processing ${cryptoResponses.length} crypto API responses`);
      
      let savedCount = 0;
      const minDate = moment('2024-02-01', 'YYYY-MM-DD').toDate();
      
      for (const response of cryptoResponses) {
        if (!response) continue;
        
        const metaData = response['Meta Data'];
        const timeSeries = response['Time Series (Digital Currency Daily)'];
        
        if (!metaData || !timeSeries) {
          this.logger.warn('Missing metadata or time series data in response');
          throw ExceptionFactory.cryptoInvalidData('Missing metadata or time series data in API response');
        }
        
        const symbol = metaData['2. Digital Currency Code'];
        const cryptoName = metaData['3. Digital Currency Name'];
        
        if (!symbol || !cryptoName) {
          throw ExceptionFactory.cryptoInvalidData('Missing cryptocurrency symbol or name in API response');
        }
        
        // Get the latest date entry for this symbol
        let latestEntry;
        try {
          latestEntry = await this.getLatestEntry(symbol);
        } catch (error) {
          // It's okay if no latest entry is found, we'll add all new data
          this.logger.debug(`No existing entries found for ${symbol}. Will add all new data.`);
        }
        
        const latestDate = latestEntry?.date;
        
        this.logger.debug(`Processing ${symbol} - Latest date in DB: ${latestDate || 'none'}`);
        
        // Process each date in the time series
        for (const [dateStr, data] of Object.entries(timeSeries)) {
          const recordDate = moment(dateStr, 'YYYY-MM-DD').toDate();
          
          // Only save if newer than existing and after min date
          if (
            (!latestDate || recordDate > latestDate) && 
            recordDate > minDate
          ) {
            const timeSeriesData = data as Record<string, string>;
            const createDto: CreateCryptoDto = {
              cryptoName,
              symbol,
              open: parseFloat(timeSeriesData['1. open']),
              high: parseFloat(timeSeriesData['2. high']),
              low: parseFloat(timeSeriesData['3. low']),
              close: parseFloat(timeSeriesData['4. close']),
              volume: parseFloat(timeSeriesData['5. volume']),
              date: recordDate,
            };
            
            try {
              await this.create(createDto);
              savedCount++;
              
              this.logger.debug(`Saved crypto data for ${symbol} on ${dateStr}`);
            } catch (error) {
              if (error instanceof MongoError && error.code === 11000) {
                this.logger.debug(`Skipping duplicate entry for ${symbol} on ${dateStr}`);
              } else {
                throw ExceptionFactory.cryptoCreateFailed(
                  `Failed to create entry for ${symbol} on ${dateStr}: ${error.message}`
                );
              }
            }
          }
        }
      }
      
      this.logger.debug(`Successfully saved ${savedCount} crypto price records`);
      return { success: true, count: savedCount };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      
      this.logger.error(`Error updating crypto database: ${error.message}`, error.stack);
      throw ExceptionFactory.cryptoApiError(error.message, error.stack);
    }
  }

  /**
   * Get all available dates for a specific symbol (for debugging)
   * @param symbol Cryptocurrency symbol
   * @returns Array of dates available for the symbol
   */
  async getAvailableDatesForSymbol(symbol: string): Promise<Date[]> {
    if (!symbol) {
      return [];
    }
    
    // Get all entries for this symbol without date filtering
    const entries = await this.cryptoRepository.findAll({ symbol });
    
    // Extract dates
    return entries.map(entry => entry.date).sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Query cryptocurrency data with formatted response
   * @param queryDto Query parameters containing symbol(s) and date range
   * @returns Formatted response with data array, count, and optional message
   */
  async queryData(queryDto: QueryCryptoDto): Promise<{ data: Crypto[]; count: number; message?: string }> {
    const { symbol, symbols } = queryDto;
    
    // Handle missing symbol(s)
    if (!symbol && (!symbols || symbols.length === 0)) {
      return {
        data: [],
        count: 0,
        message: 'At least one cryptocurrency symbol is required'
      };
    }
    
    // Get data from repository
    const results = await this.findBySymbolAndDateRange(queryDto);
    
    // Get queried symbols for message formatting
    const queriedSymbols = symbol 
      ? [symbol] 
      : (symbols || []);
    
    const symbolsText = queriedSymbols.length > 1
      ? `symbols [${queriedSymbols.join(', ')}]`
      : `symbol ${queriedSymbols[0] || 'unknown'}`;
    
    // Format the response
    return {
      data: results,
      count: results.length,
      message: results.length === 0 ? `No data found for ${symbolsText} in the specified date range` : undefined
    };
  }

  /**
   * Get available dates for a symbol with formatted response
   * @param symbol Cryptocurrency symbol
   * @returns Formatted response with symbol, dates array, and count
   */
  async getFormattedAvailableDates(symbol: string): Promise<{ symbol: string; dates: string[]; count: number }> {
    if (!symbol) {
      return { symbol: '', dates: [], count: 0 };
    }
    
    // Get raw dates
    const datesToSort = await this.getAvailableDatesForSymbol(symbol);
    
    // Format dates to YYYY-MM-DD strings
    const dates = datesToSort.map(date => date.toISOString().split('T')[0]);
    
    // Return formatted response
    return {
      symbol,
      dates,
      count: dates.length
    };
  }

  /**
   * Get latest entry with formatted response
   * @param symbolOrSymbols Single cryptocurrency symbol or array of symbols
   * @returns Formatted response with data and optional message
   */
  async getFormattedLatestEntry(symbolOrSymbols?: string | string[]): Promise<{ data: Crypto | Crypto[] | null; message?: string }> {
    // Handle multiple symbols case
    if (Array.isArray(symbolOrSymbols) && symbolOrSymbols.length > 0) {
      const results = await this.getLatestEntries(symbolOrSymbols);
      
      return {
        data: results.length > 0 ? results : [],
        message: results.length === 0 ? `No latest data found for symbols [${symbolOrSymbols.join(', ')}]` : undefined
      };
    }
    
    // Handle single symbol case
    const result = await this.getLatestEntry(symbolOrSymbols as string);
    
    return {
      data: result,
      message: !result ? `No latest data found${symbolOrSymbols ? ` for symbol ${symbolOrSymbols}` : ''}` : undefined
    };
  }

  /**
   * Format response for batch creation
   * @param result Result from createManyWithDuplicateHandling
   * @returns Formatted response with success, count, and skipped
   */
  formatBatchCreationResponse(result: { savedEntries: CryptoDocument[]; skippedCount: number }): { success: boolean; count: number; skipped: number } {
    return {
      success: true,
      count: result.savedEntries.length,
      skipped: result.skippedCount
    };
  }

  /**
   * Parse raw query parameters and execute a cryptocurrency data query
   * This handles parsing comma-separated symbols and date strings
   * @param queryParams Raw query parameters from controller
   * @returns Formatted response with data array, count, and optional message
   */
  async processQueryRequest(queryParams: any): Promise<{ data: Crypto[]; count: number; message?: string }> {
    // Process query parameters using standardized method
    const parsedParams = this.processQueryParams(queryParams, {
      stringParams: ['symbol'],
      commaSeparatedParams: ['symbols'],
      dateRanges: [{
        startParam: 'startDate',
        endParam: 'endDate',
        resultKey: 'dateRange',
        defaultDaysBack: 30
      }]
    });
    
    // Prepare DTO using processed parameters
    const queryDto = new QueryCryptoDto();
    
    if (parsedParams.symbols && parsedParams.symbols.length > 0) {
      queryDto.symbols = parsedParams.symbols;
    } else {
      queryDto.symbol = parsedParams.symbol;
    }
    
    if (parsedParams.dateRange) {
      queryDto.startDate = parsedParams.dateRange.startDate;
      queryDto.endDate = parsedParams.dateRange.endDate;
    }
    
    // Use existing method to process the query
    return this.queryData(queryDto);
  }

  /**
   * Process a request for latest cryptocurrency data
   * This handles both single symbol and comma-separated multiple symbols
   * @param symbol Optional single symbol query parameter
   * @param symbolsParam Optional comma-separated symbols parameter
   * @returns Formatted response with data and optional message
   */
  async processLatestRequest(symbol?: string, symbolsParam?: string): Promise<{ data: Crypto | Crypto[] | null; message?: string }> {
    // Process query parameters using standardized method
    const parsedParams = this.processQueryParams(
      { symbol, symbols: symbolsParam }, 
      {
        stringParams: ['symbol'],
        commaSeparatedParams: ['symbols']
      }
    );
    
    if (parsedParams.symbols && parsedParams.symbols.length > 0) {
      return this.getFormattedLatestEntry(parsedParams.symbols);
    }
    
    // Handle single symbol case
    return this.getFormattedLatestEntry(parsedParams.symbol);
  }
} 