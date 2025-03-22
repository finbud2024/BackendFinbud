import { IsString, IsNumber, IsNotEmpty, IsDate, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: string;

  @IsMongoId()
  @IsNotEmpty()
  userId: string;
} 