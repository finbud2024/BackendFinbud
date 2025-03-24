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
   * Query cryptocurrency data by symbol and date range
   */
  @Get('query')
  async queryCryptoData(@Query() queryDto: QueryCryptoDto) {
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
   * Get the latest cryptocurrency entry
   */
  @Get('latest')
  async getLatestCrypto(@Query('symbol') symbol?: string) {
    return this.cryptoService.getFormattedLatestEntry(symbol);
  }
} 