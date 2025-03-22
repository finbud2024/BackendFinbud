import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema }
    ]),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionsRepository,
  ],
  exports: [
    TransactionsService,
    TransactionsRepository,
  ],
})
export class TransactionsModule {} 