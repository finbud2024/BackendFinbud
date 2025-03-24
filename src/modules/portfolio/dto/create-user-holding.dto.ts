import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class StockHoldingDto {
  @IsString()
  @IsNotEmpty()
  stockSymbol: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  purchasePrice: number;
}

export class CreateUserHoldingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StockHoldingDto)
  stocks?: StockHoldingDto[];
} 