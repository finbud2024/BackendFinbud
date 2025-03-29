export class TradeResult {
  /**
   * Type of trade: 'm' (market) or 's' (side trade)
   */
  type: 'm' | 's';
  
  /**
   * Action: 'b' (buy) or 's' (sell)
   */
  action: 'b' | 's';
  
  /**
   * The value/price at which the trade was executed
   */
  value: number;
  
  /**
   * Time of trade (in minutes from start)
   */
  time: number;
  
  /**
   * ID for side trades
   */
  id?: number;
  
  /**
   * Actual value of the multiplier at the time of result calculation
   */
  actualValue: number;
  
  /**
   * Profit/loss from the trade
   */
  profit: number;
  
  constructor(data: {
    type: 'm' | 's';
    action: 'b' | 's';
    value: number;
    time: number;
    actualValue: number;
    profit: number;
    id?: number;
  }) {
    Object.assign(this, data);
  }
} 