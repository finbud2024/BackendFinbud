import { Module, forwardRef } from '@nestjs/common';
import { TradingEngineService } from './services/trading-engine.service';
import { TradingEngineController } from './controllers/trading-engine.controller';
import { TradingEngineGateway } from './gateways/trading-engine.gateway';

@Module({
  controllers: [TradingEngineController],
  providers: [
    TradingEngineService, 
    TradingEngineGateway
  ],
  exports: [TradingEngineService, TradingEngineGateway],
})
export class QuantSimulatorModule {} 