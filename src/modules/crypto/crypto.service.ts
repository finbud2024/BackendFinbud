import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { CryptoRepository } from './repositories/crypto.repository';
import { Crypto, CryptoDocument } from './entities/crypto.entity';
import { CreateCryptoDto } from './dto/create-crypto.dto';
import { QueryCryptoDto } from './dto/query-crypto.dto';
import moment from 'moment';

@Injectable()
export class CryptoService extends BaseService<CryptoDocument> {
  constructor(private readonly cryptoRepository: CryptoRepository) {
    super(cryptoRepository, 'Crypto');
  }

  /**
   * Find crypto data by symbol and date range
   * @param queryDto Query parameters containing symbol and date range
   * @returns Array of crypto documents
   */
  async findBySymbolAndDateRange(queryDto: QueryCryptoDto): Promise<Crypto[]> {
    const { symbol, startDate, endDate } = queryDto;
    
    // Set default date range if not provided
    const start = startDate || moment().subtract(30, 'days').toDate();
    const end = endDate || new Date();
    
    return this.cryptoRepository.findBySymbolAndDateRange(symbol, start, end);
  }

  /**
   * Get the latest entry in the database
   * @param symbol Optional cryptocurrency symbol
   * @returns The latest crypto document or null
   */
  async getLatestEntry(symbol?: string): Promise<Crypto | null> {
    return this.cryptoRepository.getLatestEntry(symbol);
  }

  /**
   * Process and save cryptocurrency data from API responses
   * @param cryptoResponses Array of cryptocurrency API responses
   * @returns Success status
   */
  async updateCryptoDatabase(cryptoResponses: any[]): Promise<{ success: boolean; count: number }> {
    try {
      this.logger.debug(`Processing ${cryptoResponses.length} crypto API responses`);
      
      let savedCount = 0;
      const minDate = moment('2024-02-01', 'YYYY-MM-DD').toDate();
      
      for (const response of cryptoResponses) {
        if (!response) continue;
        
        const metaData = response['Meta Data'];
        const timeSeries = response['Time Series (Digital Currency Daily)'];
        
        if (!metaData || !timeSeries) {
          this.logger.warn('Missing metadata or time series data in response');
          continue;
        }
        
        const symbol = metaData['2. Digital Currency Code'];
        const cryptoName = metaData['3. Digital Currency Name'];
        
        // Get the latest date entry for this symbol
        const latestEntry = await this.getLatestEntry(symbol);
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
            
            await this.create(createDto);
            savedCount++;
            
            this.logger.debug(`Saved crypto data for ${symbol} on ${dateStr}`);
          }
        }
      }
      
      this.logger.debug(`Successfully saved ${savedCount} crypto price records`);
      return { success: true, count: savedCount };
    } catch (error) {
      this.logger.error(`Error updating crypto database: ${error.message}`, error.stack);
      throw error;
    }
  }
} 