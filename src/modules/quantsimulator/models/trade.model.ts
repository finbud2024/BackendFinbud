export class Trade {
  /**
   * Type of trade: 'm' (market) or 's' (side trade)
   */
  type: 'm' | 's';
  
  /**
   * Action: 'b' (buy) or 's' (sell)
   */
  action: 'b' | 's';
  
  /**
   * The value/price of the trade
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
  
  constructor(data: {
    type: 'm' | 's';
    action: 'b' | 's';
    value: number;
    time: number;
    id?: number;
  }) {
    Object.assign(this, data);
  }
} 