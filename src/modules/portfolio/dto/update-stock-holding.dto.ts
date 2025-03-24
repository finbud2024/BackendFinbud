import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateStockHoldingDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  purchasePrice?: number;
} 