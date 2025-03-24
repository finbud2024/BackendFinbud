import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class AddPortfolioEntryDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  totalValue: number;
} 