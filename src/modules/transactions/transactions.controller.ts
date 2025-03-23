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
import { OwnerOrAdminGuard } from '../../common/guards/owner-or-admin.guard';
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
    
    // Set userId to the current user if not provided
    if (!createTransactionDto.userId) {
      createTransactionDto.userId = userId;
    } else if (createTransactionDto.userId !== userId && (request.user as any).priviledge !== 'admin') {
      // Non-admin users can only create transactions for themselves
      createTransactionDto.userId = userId;
    }

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
  @UseGuards(OwnerOrAdminGuard)
  async findAllForUser(
    @Param('userId') userId: string,
    @UserRole() userRole: string,
    @Req() request: Request,
  ) {
    const effectiveUserId = userId === 'self' 
      ? this.getUserIdFromRequest(request) 
      : userId;
      
    this.logger.log(`Finding all transactions for user ${effectiveUserId}`);
    
    return this.transactionsService.getTransactionsWithBalances(effectiveUserId);
  }

  @Get(':id')
  @UseGuards(OwnerOrAdminGuard)
  async findOne(
    @Param('id') id: string,
    @UserRole() userRole: string,
  ) {
    this.logger.log(`Finding transaction with ID ${id}`);
    
    const transaction = await this.transactionsService.findById(id);
    
    // Check if transaction exists
    if (!transaction) {
      throw ExceptionFactory.transactionNotFound(id);
    }
    
    return transaction;
  }

  @Patch(':id')
  @UseGuards(OwnerOrAdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @UserRole() userRole: string,
    @Req() request: Request,
  ) {
    this.logger.log(`Updating transaction with ID ${id}`);
    
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
    
    // Prevent changing userId for non-admin users
    if (updateTransactionDto.userId && 
        userRole !== 'admin' && 
        updateTransactionDto.userId !== this.getUserIdFromRequest(request)) {
      throw ExceptionFactory.invalidTransactionData('userId cannot be changed by non-admin users');
    }
    
    // Update the transaction
    const updated = await this.transactionsService.update(id, updateTransactionDto);
    
    // Return the updated transaction
    return updated;
  }

  @Delete(':id')
  @UseGuards(OwnerOrAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @UserRole() userRole: string,
  ) {
    this.logger.log(`Removing transaction with ID ${id}`);
    
    // Find the transaction to check existence
    const transaction = await this.transactionsService.findById(id);
    
    // Check if transaction exists
    if (!transaction) {
      throw ExceptionFactory.transactionNotFound(id);
    }
    
    // Remove the transaction
    await this.transactionsService.remove(id);
    
    // No content response (204)
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

  @Delete('all')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll() {
    this.logger.log('Removing all transactions (admin only)');
    await this.transactionsService.removeMany({});
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