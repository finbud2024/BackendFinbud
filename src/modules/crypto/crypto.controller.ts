import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QueryCryptoDto } from './dto/query-crypto.dto';
import { Crypto } from './entities/crypto.entity';
import { UpdateCryptoDbDto } from './dto/update-crypto-db.dto';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  /**
   * Query cryptocurrency data by symbol and date range
   */
  @Post('query')
  async queryCryptoData(@Body() queryDto: QueryCryptoDto): Promise<Crypto[]> {
    return this.cryptoService.findBySymbolAndDateRange(queryDto);
  }

  /**
   * Update cryptocurrency database with external API data
   */
  @Post('update-db')
  async updateCryptoDB(@Body() updateDto: UpdateCryptoDbDto): Promise<{ success: boolean; count: number }> {
    return this.cryptoService.updateCryptoDatabase(updateDto.cryptoResponses);
  }

  /**
   * Get the latest cryptocurrency entry
   */
  @Get('latest')
  async getLatestCrypto(@Query('symbol') symbol?: string): Promise<Crypto | null> {
    return this.cryptoService.getLatestEntry(symbol);
  }
} 