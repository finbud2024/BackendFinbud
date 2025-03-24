import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { UserHoldingRepository } from './repositories/user-holding.repository';
import { Portfolio, PortfolioSchema } from './entities/portfolio.entity';
import { UserHolding, UserHoldingSchema } from './entities/user-holding.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: UserHolding.name, schema: UserHoldingSchema }
    ])
  ],
  controllers: [PortfolioController],
  providers: [
    PortfolioService,
    PortfolioRepository,
    UserHoldingRepository
  ],
  exports: [
    PortfolioService,
    PortfolioRepository,
    UserHoldingRepository
  ]
})
export class PortfolioModule {} 