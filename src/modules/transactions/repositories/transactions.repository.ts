import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../entities/transaction.entity';
import { BaseRepository } from '../../../common/base/base.repository';

@Injectable()
export class TransactionsRepository extends BaseRepository<TransactionDocument> {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
  ) {
    super(transactionModel, 'Transaction');
  }

  /**
   * Get the current balance for a user
   */
  async getCurrentBalance(userId: string): Promise<number> {
    this.logger.debug(`Calculating current balance for user ${userId}`);
    const result = await this.aggregate([
      { $match: { userId: this.toObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Recalculate balances for user transactions
   * This matches the original Express implementation by sorting by date ascending
   * and updating each transaction's balance field
   */
  async recalculateBalances(userId: string): Promise<TransactionDocument[]> {
    this.logger.debug(`Recalculating balances for user ${userId}`);
    
    // Get all transactions for the user sorted by date ASCENDING (chronological order)
    // This is important for correct balance calculation
    const transactions = await this.findAll(
      { userId: this.toObjectId(userId) }, 
      { sort: { date: 1 } }
    );
    
    let runningBalance = 0;
    const updatedTransactions: TransactionDocument[] = [];
    
    // Update each transaction with the new running balance
    for (const transaction of transactions) {
      runningBalance += transaction.amount;
      
      if (transaction.balance !== runningBalance) {
        const updated = await this.update(transaction.id, { 
          balance: runningBalance 
        });
        
        if (updated) {
          updatedTransactions.push(updated);
        }
      } else {
        updatedTransactions.push(transaction);
      }
    }
    
    return updatedTransactions;
  }
} 