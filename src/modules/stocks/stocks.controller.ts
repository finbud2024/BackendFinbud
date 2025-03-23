import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Logger,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { TradingViewService, StockSearchParams } from './services/tradingview.service';

@Controller('stocks')
export class StocksController {
  private readonly logger = new Logger(StocksController.name);

  constructor(
    private readonly stocksService: StocksService,
    private readonly tradingViewService: TradingViewService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createStockDto: CreateStockDto) {
    this.logger.log(`Creating stock entry for symbol: ${createStockDto.symbol}`);
    return this.stocksService.create(createStockDto);
  }

  @Post('batch')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStockDB(@Body() body: { symbol: string, data: any[] }) {
    this.logger.log(`Batch updating stock data for symbol: ${body.symbol}`);
    const { symbol, data } = body;
    
    // Process and save each stock data entry
    const results = await this.stocksService.updateStockBatch(symbol, data);
    
    return {
      message: `Successfully processed ${results.saved} entries for symbol ${symbol}`,
      saved: results.saved,
      skipped: results.skipped
    };
  }

  @Get('market')
  async getMarketData(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('markets') markets?: string,
  ) {
    this.logger.log('Fetching market data from TradingView');
    
    const params: StockSearchParams = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
      markets
    };
    
    return this.tradingViewService.fetchStocksData(params);
  }

  @Get()
  async findAll() {
    this.logger.log('Getting all stocks (limited results)');
    // Limit to most recent 100 entries to prevent overwhelming response
    return this.stocksService.findAll({}, { 
      sort: { date: -1 },
      limit: 100
    });
  }

  @Get('latest')
  async getLatestEntry() {
    this.logger.log('Getting latest stock entry date');
    return this.stocksService.getLatestEntry();
  }

  @Get('symbols')
  async getSymbols() {
    this.logger.log('Getting all available stock symbols');
    return this.stocksService.getAvailableSymbols();
  }

  @Get('symbol/:symbol')
  async findBySymbol(@Param('symbol') symbol: string) {
    this.logger.log(`Finding stock data for symbol: ${symbol}`);
    return this.stocksService.findBySymbol(symbol);
  }

  @Get('latest/:symbol')
  async getLatestPrice(@Param('symbol') symbol: string) {
    this.logger.log(`Getting latest price for symbol: ${symbol}`);
    return this.stocksService.getLatestPrice(symbol);
  }

  @Get('historical/:symbol')
  async getHistoricalData(
    @Param('symbol') symbol: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    this.logger.log(`Getting historical data for ${symbol} from ${startDate} to ${endDate}`);
    return this.stocksService.getHistoricalData(symbol, startDate, endDate);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Finding stock by ID: ${id}`);
    return this.stocksService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    this.logger.log(`Updating stock with ID: ${id}`);
    return this.stocksService.update(id, updateStockDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Removing stock with ID: ${id}`);
    await this.stocksService.remove(id);
  }
} 