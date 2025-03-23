import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { UserRole } from '../../common/decorators/user-role.decorator';
import { TransactionDocument } from './entities/transaction.entity';
import { Request } from 'express';
import { ExceptionFactory } from '../../common/exceptions/app.exception';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() request: Request,
  ): Promise<TransactionDocument> {
    // Validate required fields
    if (!createTransactionDto.description || createTransactionDto.amount === undefined) {
      throw ExceptionFactory.invalidTransactionData('description and amount');
    }

    // Get the userId from request
    const userId = this.getUserIdFromRequest(request);
    
    // Set the userId from the authenticated user - this is simpler
    createTransactionDto.userId = userId;
    
    // If the user is an admin and explicitly provided a different userId, let them create
    // transactions for other users
    const isAdmin = (request.user as any).priviledge === 'admin';
    // No additional logic needed for non-admin users - they can only create for themselves
    
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    this.logger.log('Finding all transactions (admin only)');
    return this.transactionsService.findAll();
  }

  @Get('my')
  async findAllMy(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Finding all transactions for user ${userId}`);
    
    // Return transactions with recalculated balances
    return this.transactionsService.getTransactionsWithBalances(userId);
  }

  @Get('u/:userId')
  @UseGuards(JwtAuthGuard)
  async findAllForUser(
    @Param('userId') userId: string,
    @Req() request: Request,
  ) {
    // Get the authenticated user
    const user = request.user as any;
    const isAdmin = user.accountData?.priviledge === 'admin';
    
    // Only allow access if the user is viewing their own transactions or is an admin
    if (userId !== user.userId && !isAdmin) {
      this.logger.warn(`User ${user.userId} attempted to access transactions for user ${userId}`);
      throw ExceptionFactory.forbidden('User-specific resource');
    }
    
    const effectiveUserId = userId === 'self' 
      ? this.getUserIdFromRequest(request) 
      : userId;
      
    this.logger.log(`Finding all transactions for user ${effectiveUserId}`);
    
    return this.transactionsService.getTransactionsWithBalances(effectiveUserId);
  }

  @Delete('all')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll() {
    this.logger.log('Removing all transactions (admin only)');
    await this.transactionsService.removeMany({});
    return;
  }

  @Delete('my/all')
  async removeAllMy(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Removing all transactions for user ${userId}`);
    
    const count = await this.transactionsService.removeAllForUser(userId);
    return { message: `Successfully deleted ${count} transactions` };
  }

  @Delete('u/:userId')
  @UseGuards(AdminGuard)
  async removeAllForUser(@Param('userId') userId: string) {
    this.logger.log(`Removing all transactions for user ${userId}`);
    
    const count = await this.transactionsService.removeAllForUser(userId);
    return { message: `Successfully deleted ${count} transactions` };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    this.logger.log(`Finding transaction with ID ${id}`);
    
    // Get the authenticated user
    const user = request.user as any;
    this.logger.debug(`User from request: ${JSON.stringify(user)}`);
    
    // Get the transaction
    const transaction = await this.transactionsService.findById(id);
    
    // Check if transaction exists
    if (!transaction) {
      throw ExceptionFactory.transactionNotFound(id);
    }
    
    this.logger.debug(`Transaction userId: ${transaction.userId} (${typeof transaction.userId})`);
    this.logger.debug(`User userId: ${user.userId} (${typeof user.userId})`);
    
    // Check if user owns this transaction or is admin
    const isOwner = transaction.userId.toString() === user.userId;
    const isAdmin = user.accountData?.priviledge === 'admin';
    
    this.logger.debug(`Is owner: ${isOwner}, Is admin: ${isAdmin}`);
    
    if (!isOwner && !isAdmin) {
      this.logger.warn(`User ${user.userId} attempted to access transaction ${id} belonging to user ${transaction.userId}`);
      throw ExceptionFactory.forbidden('User-specific resource');
    }
    
    return transaction;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() request: Request,
  ) {
    this.logger.log(`Updating transaction with ID ${id}`);
    
    // Get the authenticated user
    const user = request.user as any;
    
    // Validate that at least one field to update is provided
    if (!updateTransactionDto.description && updateTransactionDto.amount === undefined) {
      throw ExceptionFactory.invalidTransactionData('at least one field (description or amount)');
    }
    
    // Find the transaction to check existence
    const transaction = await this.transactionsService.findById(id);
    
    // Check if transaction exists
    if (!transaction) {
      throw ExceptionFactory.transactionNotFound(id);
    }
    
    // Check if user owns this transaction or is admin
    const isOwner = transaction.userId.toString() === user.userId;
    const isAdmin = user.accountData?.priviledge === 'admin';
    
    if (!isOwner && !isAdmin) {
      this.logger.warn(`User ${user.userId} attempted to update transaction ${id} belonging to user ${transaction.userId}`);
      throw ExceptionFactory.forbidden('User-specific resource');
    }
    
    // Prevent changing userId for non-admin users
    if (updateTransactionDto.userId && 
        !isAdmin && 
        updateTransactionDto.userId !== user.userId) {
      throw ExceptionFactory.invalidTransactionData('userId cannot be changed by non-admin users');
    }
    
    // Update the transaction
    const updated = await this.transactionsService.update(id, updateTransactionDto);
    
    // Return the updated transaction
    return updated;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    this.logger.log(`Removing transaction with ID ${id}`);
    
    // Get the authenticated user
    const user = request.user as any;
    
    // Find the transaction to check existence
    const transaction = await this.transactionsService.findById(id);
    
    // Check if transaction exists
    if (!transaction) {
      throw ExceptionFactory.transactionNotFound(id);
    }
    
    // Check if user owns this transaction or is admin
    const isOwner = transaction.userId.toString() === user.userId;
    const isAdmin = user.accountData?.priviledge === 'admin';
    
    if (!isOwner && !isAdmin) {
      this.logger.warn(`User ${user.userId} attempted to delete transaction ${id} belonging to user ${transaction.userId}`);
      throw ExceptionFactory.forbidden('User-specific resource');
    }
    
    // Remove the transaction
    await this.transactionsService.remove(id);
    
    // No content response (204)
    return;
  }
  
  // Helper method to get the user ID from the request object
  private getUserIdFromRequest(request: Request): string {
    const user = request.user as any;
    if (!user || !user.userId) {
      this.logger.error('User not found in request or missing userId');
      throw ExceptionFactory.unauthorized('User identity not found in request');
    }
    return user.userId;
  }
} 