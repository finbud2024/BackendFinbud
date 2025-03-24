import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PortfolioEntryDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  totalValue: number;
}

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PortfolioEntryDto)
  portfolio?: PortfolioEntryDto[];
} 