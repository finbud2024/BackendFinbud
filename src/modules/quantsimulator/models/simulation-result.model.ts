import { Trade } from './trade.model';

export class SimulationResult {
  /**
   * Original simulation session ID
   */
  simulationId: string;
  
  /**
   * User ID who ran the simulation
   */
  userId: string;
  
  /**
   * Final market multiplier value
   */
  finalMultiplier: number;
  
  /**
   * Net profit/loss from all trades
   */
  netProfit: number;
  
  /**
   * Detailed results of all trades
   */
  tradeResults: Array<{
    type: 'm' | 's';
    action: 'b' | 's';
    value: number;
    time: number;
    id?: number;
    actualValue: number;
    profit: number;
  }>;
  
  /**
   * History of multiplier values during the simulation
   */
  multiplierHistory: number[];
  
  /**
   * Final wallet balance including profits/losses
   */
  finalWallet: number;
  
  /**
   * When the simulation was completed
   */
  completedAt: Date;
  
  constructor(data: SimulationResult) {
    Object.assign(this, data);
  }
} 