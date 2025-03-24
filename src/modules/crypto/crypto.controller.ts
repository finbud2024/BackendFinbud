import { Body, Controller, Get, Post, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QueryCryptoDto } from './dto/query-crypto.dto';
import { Crypto } from './entities/crypto.entity';
import { UpdateCryptoDbDto } from './dto/update-crypto-db.dto';
import { CreateCryptoDto } from './dto/create-crypto.dto';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  /**
   * Query cryptocurrency data by symbol(s) and date range
   */
  @Get('query')
  async queryCryptoData(@Query() query: any) {
    const queryDto = new QueryCryptoDto();
    
    // Handle multiple symbols if provided as comma-separated string
    if (query.symbols && typeof query.symbols === 'string') {
      queryDto.symbols = query.symbols.split(',').map(s => s.trim());
    } else {
      queryDto.symbol = query.symbol;
    }
    
    // Copy date parameters
    queryDto.startDate = query.startDate ? new Date(query.startDate) : undefined;
    queryDto.endDate = query.endDate ? new Date(query.endDate) : undefined;
    
    return this.cryptoService.queryData(queryDto);
  }

  /**
   * Get all available dates for a specific symbol (for debugging)
   */
  @Get('available-dates')
  async getAvailableDates(@Query('symbol') symbol: string) {
    return this.cryptoService.getFormattedAvailableDates(symbol);
  }

  /**
   * Create a single cryptocurrency entry
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCrypto(@Body() createDto: CreateCryptoDto): Promise<Crypto> {
    return this.cryptoService.create(createDto);
  }

  /**
   * Create multiple cryptocurrency entries
   */
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createManyCryptos(@Body() createDto: { cryptos: CreateCryptoDto[] }) {
    const result = await this.cryptoService.createManyWithDuplicateHandling(createDto.cryptos);
    return this.cryptoService.formatBatchCreationResponse(result);
  }

  /**
   * Update cryptocurrency database with external API data
   */
  @Post('update-db')
  async updateCryptoDB(@Body() updateDto: UpdateCryptoDbDto) {
    return this.cryptoService.updateCryptoDatabase(updateDto.cryptoResponses);
  }

  /**
   * Get the latest cryptocurrency entry for one or multiple symbols
   */
  @Get('latest')
  async getLatestCrypto(@Query('symbol') symbol?: string, @Query('symbols') symbolsParam?: string) {
    // Handle multiple symbols if provided as comma-separated string
    if (symbolsParam) {
      const symbols = symbolsParam.split(',').map(s => s.trim());
      return this.cryptoService.getFormattedLatestEntry(symbols);
    }
    
    // Handle single symbol case
    return this.cryptoService.getFormattedLatestEntry(symbol);
  }
} 