import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCryptoDto {
  @IsNotEmpty()
  @IsString()
  cryptoName: string;

  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsNumber()
  open: number;

  @IsOptional()
  @IsNumber()
  low?: number;

  @IsOptional()
  @IsNumber()
  high?: number;

  @IsNotEmpty()
  @IsNumber()
  close: number;

  @IsOptional()
  @IsNumber()
  change?: number;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;
} 