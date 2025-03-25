import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TransactionDocument, Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ExceptionFactory } from '../../common/exceptions/app.exception';
import { Types } from 'mongoose';
import { TransactionType } from './entities/transaction.entity';
import { Request } from 'express';

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
        createTransactionDto.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
    }
    
    // Always set an initial balance value (it will be recalculated immediately after creation)
    // This satisfies the database schema requirement for balance to be present
    if (createTransactionDto.balance === undefined) {
      createTransactionDto.balance = 0;
    }
    
    try {
      // Ensure userId is a MongoDB ObjectId
      if (typeof createTransactionDto.userId === 'string') {
        createTransactionDto.userId = new Types.ObjectId(createTransactionDto.userId);
      }
      
      // Create the transaction
      const transaction = await super.create(createTransactionDto);
      
      // Recalculate balances for all user transactions
      await this.transactionsRepository.recalculateBalances(transaction.userId.toString());
      
      // Fetch the transaction again to get the updated balance
      return this.findById(transaction.id);
    } catch (error) {
      this.logger.error(`Error creating transaction: ${error.message}`);
      if (error.message && error.message.includes('userId')) {
        throw ExceptionFactory.invalidTransactionData('Valid userId is required');
      }
      throw error;
    }
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
      throw ExceptionFactory.transactionDeleteFailed(userId, `Failed to delete transactions: ${error.message}`);
    }
  }

  /**
   * Check if a transaction exists and get it
   * @param id Transaction ID
   * @returns Transaction document
   * @throws NotFoundException if transaction doesn't exist
   */
  async getTransactionOrFail(id: string): Promise<TransactionDocument> {
    const transaction = await this.findById(id);
    if (!transaction) {
      throw ExceptionFactory.transactionNotFound(id);
    }
    return transaction;
  }

  /**
   * Check if a user has permission to access/modify a transaction
   * @param transactionId Transaction ID
   * @param user User object from request
   * @returns Transaction document if user has access
   * @throws Forbidden exception if user doesn't have access
   */
  async checkTransactionAccess(transactionId: string, user: any): Promise<TransactionDocument> {
    const transaction = await this.getTransactionOrFail(transactionId);
    
    const isOwner = transaction.userId.toString() === user.userId;
    const isAdmin = user.accountData?.priviledge === 'admin';
    
    if (!isOwner && !isAdmin) {
      this.logger.warn(`User ${user.userId} attempted to access transaction ${transactionId} belonging to user ${transaction.userId}`);
      throw ExceptionFactory.forbidden('User-specific resource');
    }
    
    return transaction;
  }

  /**
   * Validate transaction create data
   * @param createTransactionDto Transaction data to validate
   * @throws BadRequestException if data is invalid
   */
  validateCreateData(createTransactionDto: CreateTransactionDto): void {
    if (!createTransactionDto.description || createTransactionDto.amount === undefined) {
      throw ExceptionFactory.invalidTransactionData('description and amount');
    }
  }

  /**
   * Validate transaction update data
   * @param updateTransactionDto Transaction data to validate
   * @throws BadRequestException if data is invalid
   */
  validateUpdateData(updateTransactionDto: UpdateTransactionDto): void {
    if (!updateTransactionDto.description && updateTransactionDto.amount === undefined) {
      throw ExceptionFactory.invalidTransactionData('at least one field (description or amount)');
    }
  }

  /**
   * Create a transaction with authorization checks
   * @param createTransactionDto Transaction data
   * @param request Request object
   * @returns Created transaction
   */
  async createWithAuth(createTransactionDto: CreateTransactionDto, request: Request): Promise<TransactionDocument> {
    this.validateCreateData(createTransactionDto);
    
    // Get the userId from request
    const userId = this.getUserIdFromRequest(request);
    const user = request.user as any;
    const isAdmin = user.accountData?.priviledge === 'admin';
    
    // If userId is provided in the DTO and user is not admin, ensure it matches the authenticated user
    if (createTransactionDto.userId && 
        !isAdmin && 
        createTransactionDto.userId.toString() !== userId) {
      throw ExceptionFactory.forbidden('Cannot create transactions for other users');
    }
    
    // Set the userId from the authenticated user if not provided
    createTransactionDto.userId = createTransactionDto.userId || userId;
    
    return this.create(createTransactionDto);
  }

  /**
   * Get a transaction with authorization checks
   * @param id Transaction ID
   * @param request Request object
   * @returns Transaction if authorized
   */
  async findOneWithAuth(id: string, request: Request): Promise<TransactionDocument> {
    return this.checkTransactionAccess(id, request.user);
  }

  /**
   * Update a transaction with authorization checks
   * @param id Transaction ID
   * @param updateTransactionDto Update data
   * @param request Request object
   * @returns Updated transaction
   */
  async updateWithAuth(id: string, updateTransactionDto: UpdateTransactionDto, request: Request): Promise<TransactionDocument> {
    this.validateUpdateData(updateTransactionDto);
    
    const user = request.user as any;
    const transaction = await this.checkTransactionAccess(id, user);
    const isAdmin = user.accountData?.priviledge === 'admin';
    
    // Prevent changing userId for non-admin users
    if (updateTransactionDto.userId && 
        !isAdmin && 
        updateTransactionDto.userId.toString() !== user.userId) {
      throw ExceptionFactory.invalidTransactionData('userId cannot be changed by non-admin users');
    }
    
    return this.update(id, updateTransactionDto);
  }

  /**
   * Remove a transaction with authorization checks
   * @param id Transaction ID
   * @param request Request object
   */
  async removeWithAuth(id: string, request: Request): Promise<void> {
    await this.checkTransactionAccess(id, request.user);
    await this.remove(id);
  }

  /**
   * Resolve user ID, handling special 'self' value
   * @param userId User ID from request params (may be 'self')
   * @param request Express request object (for getting current user)
   * @returns Resolved user ID
   */
  resolveUserId(userId: string, request: Request): string {
    if (userId === 'self') {
      return this.getUserIdFromRequest(request);
    }
    return userId;
  }

  /**
   * Get transactions for a user with authorization check
   * @param userId User ID (or 'self')
   * @param request Request object
   * @returns Transactions for the user if authorized
   */
  async getTransactionsForUserWithAuth(userId: string, request: Request): Promise<TransactionDocument[]> {
    const user = request.user as any;
    const isAdmin = user.accountData?.priviledge === 'admin';
    const requestUserId = this.getUserIdFromRequest(request);
    
    // Resolve the user ID (handling 'self')
    const effectiveUserId = this.resolveUserId(userId, request);
    
    // Only allow access if the user is viewing their own transactions or is an admin
    if (effectiveUserId !== requestUserId && !isAdmin) {
      this.logger.warn(`User ${requestUserId} attempted to access transactions for user ${effectiveUserId}`);
      throw ExceptionFactory.forbidden('User-specific resource');
    }
    
    return this.getTransactionsWithBalances(effectiveUserId);
  }

  /**
   * Remove all transactions for a user with authorization check
   * @param request Request object
   * @returns Success message
   */
  async removeAllForUserWithAuth(request: Request): Promise<{ message: string }> {
    const userId = this.getUserIdFromRequest(request);
    const count = await this.removeAllForUser(userId);
    return { message: `Successfully deleted ${count} transactions` };
  }

  /**
   * Remove all transactions for a specific user (admin only)
   * @param userId User ID to delete transactions for
   * @returns Success message
   */
  async removeAllForUserAdmin(userId: string): Promise<{ message: string }> {
    // This is intended to be used with AdminGuard, so no additional authorization checks
    const count = await this.removeAllForUser(userId);
    return { message: `Successfully deleted ${count} transactions` };
  }

  /**
   * Remove all transactions (admin only)
   */
  async removeAllAdmin(): Promise<void> {
    // This is intended to be used with AdminGuard, so no additional authorization checks
    await this.removeMany({});
  }
} 