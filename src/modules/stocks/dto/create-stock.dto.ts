import { IsString, IsNumber, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  @IsNotEmpty()
  open: number;

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
  @IsNotEmpty()
  date: Date;
} 