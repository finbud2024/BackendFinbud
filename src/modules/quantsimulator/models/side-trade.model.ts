export class SideTrade {
  /**
   * Unique identifier for the side trade
   */
  id: number;
  
  /**
   * The mathematical expression that determines the value
   */
  expression: string;
  
  /**
   * The price of the side trade
   */
  price: number;
  
  /**
   * Time (in minutes) when the trade will expire
   */
  expiry: number;
  
  /**
   * The current value of the trade
   */
  value: number;
  
  constructor(data: {
    id: number;
    expression: string;
    price: number;
    expiry: number;
  }) {
    this.id = data.id;
    this.expression = data.expression;
    this.price = data.price;
    this.expiry = data.expiry;
    this.value = data.price; // Initialize value same as price
  }
} 