import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateStockHoldingDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value, obj }) => {
    // Allow 'shares' as an alias for 'quantity'
    return obj.shares !== undefined ? obj.shares : value;
  })
  quantity: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value, obj }) => {
    // Allow 'averagePrice' as an alias for 'purchasePrice'
    return obj.averagePrice !== undefined ? obj.averagePrice : value;
  })
  purchasePrice?: number;
  
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentPrice?: number;
} 