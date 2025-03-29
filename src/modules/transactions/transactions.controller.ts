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
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { TransactionDocument } from './entities/transaction.entity';
import { Request } from 'express';
import { BaseController } from '../../common/base/base.controller';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController extends BaseController {
  constructor(private readonly transactionsService: TransactionsService) {
    super();
  }

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() request: Request,
  ): Promise<TransactionDocument> {
    return this.transactionsService.createWithAuth(createTransactionDto, request);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('my')
  async findAllMy(@Req() request: Request) {
    return this.transactionsService.getTransactionsForUserWithAuth('self', request);
  }

  @Get('u/:userId')
  async findAllForUser(
    @Param('userId') userId: string,
    @Req() request: Request,
  ) {
    return this.transactionsService.getTransactionsForUserWithAuth(userId, request);
  }

  @Delete('all')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll() {
    await this.transactionsService.removeAllAdmin();
    return;
  }

  @Delete('my/all')
  async removeAllMy(@Req() request: Request) {
    return this.transactionsService.removeAllForUserWithAuth(request);
  }

  @Delete('u/:userId')
  @UseGuards(AdminGuard)
  async removeAllForUser(@Param('userId') userId: string) {
    return this.transactionsService.removeAllForUserAdmin(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.transactionsService.findOneWithAuth(id, request);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() request: Request,
  ) {
    return this.transactionsService.updateWithAuth(id, updateTransactionDto, request);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    await this.transactionsService.removeWithAuth(id, request);
    return;
  }
} 