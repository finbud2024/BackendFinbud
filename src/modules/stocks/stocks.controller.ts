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
  HttpStatus,
  HttpCode,
  Req
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { TradingViewService, StockSearchParams } from './services/tradingview.service';
import { BaseController } from '../../common/base/base.controller';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StocksController extends BaseController {
  constructor(
    private readonly stocksService: StocksService,
    private readonly tradingViewService: TradingViewService,
  ) {
    super();
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.create(createStockDto);
  }

  @Post('batch')
  @UseGuards(AdminGuard)
  async updateStockDB(@Body() body: { symbol: string, data: any[] }) {
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
    // Limit to most recent 100 entries to prevent overwhelming response
    return this.stocksService.findAll({}, { 
      sort: { date: -1 },
      limit: 100
    });
  }

  @Get('latest')
  async getLatestEntry() {
    return this.stocksService.getLatestEntry();
  }

  @Get('symbols')
  async getSymbols() {
    return this.stocksService.getAvailableSymbols();
  }

  @Get('symbol/:symbol')
  async findBySymbol(@Param('symbol') symbol: string) {
    return this.stocksService.findBySymbol(symbol);
  }

  @Get('latest/:symbol')
  async getLatestPrice(@Param('symbol') symbol: string) {
    return this.stocksService.getLatestPrice(symbol);
  }

  @Get('historical/:symbol')
  async getHistoricalData(
    @Param('symbol') symbol: string,
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    return this.stocksService.getHistoricalData(symbol, startDate, endDate);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stocksService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stocksService.update(id, updateStockDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.stocksService.remove(id);
  }
} 