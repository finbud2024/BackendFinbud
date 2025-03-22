import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionDocument, Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  TransactionCreateFailedException,
  TransactionUpdateFailedException,
  TransactionDeleteFailedException,
} from '../../common/exceptions/transaction.exceptions';
import { Types } from 'mongoose';

@Injectable()
export class TransactionsService extends BaseService<TransactionDocument> {
  protected readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly transactionsRepository: TransactionsRepository) {
    super(transactionsRepository, 'Transaction');
  }

  /**
   * Get current balance for a user
   */
  async getCurrentBalance(userId: string): Promise<number> {
    return this.transactionsRepository.getCurrentBalance(userId);
  }

  /**
   * Find all transactions for a user, sorted by date in descending order
   */
  async findByUserId(userId: string): Promise<TransactionDocument[]> {
    this.logger.log(`Finding all transactions for user with id ${userId}`);
    return this.findAll(
      { userId: new Types.ObjectId(userId) },
      { sort: { date: -1 } },
    );
  }

  /**
   * Get all transactions for a user with recalculated balances
   */
  async getTransactionsWithBalances(userId: string): Promise<TransactionDocument[]> {
    // Recalculate balances first
    await this.transactionsRepository.recalculateBalances(userId);
    
    // Then return the transactions with updated balances (sorted by date DESC for display)
    return this.findByUserId(userId);
  }

  /**
   * Create a new transaction with balance calculation
   */
  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionDocument> {
    this.logger.log(`Creating transaction for user ${createTransactionDto.userId}`);
    
    // If type is not provided, determine it based on amount
    if (!createTransactionDto.type) {
      createTransactionDto.type = 
        createTransactionDto.amount >= 0 ? 'INCOME' : 'EXPENSE';
    }

    // Create the transaction
    const transaction = await super.create(createTransactionDto);
    
    // Recalculate balances for all user transactions
    await this.transactionsRepository.recalculateBalances(transaction.userId.toString());
    
    // Fetch the transaction again to get the updated balance
    return this.findById(transaction.id);
  }

  /**
   * Update a transaction and recalculate balances
   */
  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<TransactionDocument> {
    this.logger.log(`Updating transaction with id ${id}`);
    
    // Find the transaction to get the userId
    const transaction = await this.findById(id);
    
    // Update the transaction
    const updatedTransaction = await super.update(id, updateTransactionDto);
    
    // Recalculate balances for all user transactions
    await this.transactionsRepository.recalculateBalances(transaction.userId.toString());
    
    // Fetch the updated transaction to get the latest balance
    return this.findById(id);
  }

  /**
   * Remove a transaction and recalculate balances
   */
  async remove(id: string): Promise<TransactionDocument> {
    this.logger.log(`Removing transaction with id ${id}`);
    
    // Find the transaction to get the userId
    const transaction = await this.findById(id);
    const userId = transaction.userId.toString();
    
    // Remove the transaction
    const removedTransaction = await super.remove(id);
    
    // Recalculate balances for all user transactions
    await this.transactionsRepository.recalculateBalances(userId);
    
    return removedTransaction;
  }

  /**
   * Remove all transactions for a specific user
   */
  async removeAllForUser(userId: string): Promise<number> {
    this.logger.log(`Removing all transactions for user ${userId}`);
    try {
      const result = await this.removeMany({ 
        userId: new Types.ObjectId(userId) 
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete transactions for user ${userId}`, error.stack);
      throw new TransactionDeleteFailedException(userId, `Failed to delete transactions: ${error.message}`);
    }
  }
} 