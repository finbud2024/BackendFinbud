import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

export interface StockSearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  markets?: string;
}

export interface StockMarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  exchange: string;
  sector?: string;
  industry?: string;
}

@Injectable()
export class TradingViewService {
  private readonly logger = new Logger(TradingViewService.name);
  private readonly baseUrl = 'https://scanner.tradingview.com/';
  private readonly scannerApi = 'america/scan';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch stock market data from TradingView API
   * 
   * @param params Search parameters
   * @returns List of stock market data
   */
  async fetchStocksData(params: StockSearchParams): Promise<{
    data: StockMarketData[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const { 
        page = 1, 
        pageSize = 50, 
        search = '', 
        sortBy = 'market_cap_basic', 
        sortOrder = 'desc',
        markets = 'america'
      } = params;
      
      this.logger.log(`Fetching stock data with params: ${JSON.stringify(params)}`);
      
      // Construct TradingView API request payload
      const payload: any = {
        filter: [
          {
            left: "market_type",
            operation: "in_range",
            right: ["stock", "dr", "fund"],
          },
          {
            left: "is_primary",
            operation: "equal",
            right: true,
          }
        ],
        options: {
          lang: "en",
        },
        markets: [markets],
        symbols: {
          query: {
            types: [],
          },
          tickers: [],
        },
        columns: [
          "name",
          "close",
          "change",
          "change_abs",
          "volume",
          "market_cap_basic",
          "price_52_week_high",
          "price_52_week_low",
          "exchange",
          "description",
          "type",
          "subtype",
          "update_mode",
          "sector",
          "industry",
        ],
        sort: {
          sortBy,
          sortOrder,
        },
        range: [(page - 1) * pageSize, page * pageSize],
      };
      
      // Add search filter if provided
      if (search) {
        payload.symbols.query.types = ["stock", "dr", "fund"];
        payload.symbols.tickers.push(search);
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${this.scannerApi}`, payload).pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            this.logger.error(`Error fetching stock data: ${error.message}`, error.stack);
            throw error;
          })
        )
      );

      // Format the response
      const totalCount = response?.totalCount || 0;
      const stocks = response?.data?.map((item: any) => this.formatStockData(item)) || [];

      return {
        data: stocks,
        totalCount,
        page,
        pageSize
      };
      
    } catch (error) {
      this.logger.error(`Failed to fetch stocks data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Format raw TradingView data into a standardized format
   * 
   * @param rawData Raw data from TradingView API
   * @returns Formatted stock market data
   */
  private formatStockData(rawData: any): StockMarketData {
    const d = rawData.d || [];
    
    return {
      symbol: rawData.s,
      name: d[0] || '',
      price: d[1] || 0,
      change: d[2] || 0,
      changePercent: d[3] || 0,
      volume: d[4] || 0,
      marketCap: d[5] || 0,
      exchange: d[8] || '',
      sector: d[13] || '',
      industry: d[14] || ''
    };
  }
} 