import { IsEnum, IsNumber, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for submitting a trade
 */
export class TradeDto {
  /**
   * Trade type - 'm' for market or 's' for side trade
   */
  @IsEnum(['m', 's'], { message: 'Trade type must be either m (market) or s (side)' })
  type: 'm' | 's';
  
  /**
   * Trade action - 'b' for buy or 's' for sell
   */
  @IsEnum(['b', 's'], { message: 'Trade action must be either b (buy) or s (sell)' })
  action: 'b' | 's';
  
  /**
   * Side trade ID (required for side trades)
   */
  @IsNumber()
  @IsOptional()
  id?: number;
} 