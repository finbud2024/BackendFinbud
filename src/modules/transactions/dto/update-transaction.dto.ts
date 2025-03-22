import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsOptional, IsDate, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTransactionDto } from './create-transaction.dto';
import { TransactionType } from '../entities/transaction.entity';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: string;

  @IsMongoId()
  @IsOptional()
  userId?: string;

  // Balance is managed by the system, not directly updatable by users
  // but we may need to update it in certain service methods
  @IsNumber()
  @IsOptional()
  balance?: number;
} 