import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCryptoDto {
  @ValidateIf(o => !o.symbols)
  @IsOptional()
  @IsString()
  symbol?: string;

  @ValidateIf(o => !o.symbol)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symbols?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
} 