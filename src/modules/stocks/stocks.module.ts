import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, StockSchema } from './entities/stock.entity';
import { StocksRepository } from './repositories/stocks.repository';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { TradingViewService } from './services/tradingview.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Stock.name, schema: StockSchema }
    ]),
    HttpModule
  ],
  controllers: [StocksController],
  providers: [
    StocksService,
    StocksRepository,
    TradingViewService
  ],
  exports: [
    StocksService,
    StocksRepository,
  ],
})
export class StocksModule {} 