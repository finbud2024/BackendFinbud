import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStockDto } from './create-stock.dto';

export class UpdateStockDto extends PartialType(CreateStockDto) {
  @IsString()
  @IsOptional()
  symbol?: string;

  @IsNumber()
  @IsOptional()
  open?: number;

  @IsNumber()
  @IsOptional()
  high?: number;

  @IsNumber()
  @IsOptional()
  low?: number;

  @IsNumber()
  @IsOptional()
  close?: number;

  @IsNumber()
  @IsOptional()
  change?: number;

  @IsNumber()
  @IsOptional()
  volume?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;
} 