import { SideTrade } from '../models/side-trade.model';

/**
 * Data Transfer Object for current simulation state responses
 */
export class SimulationStateDto {
  /**
   * Session identifier
   */
  sessionId: string;
  
  /**
   * Current simulation time in minutes
   */
  currentTime: number;
  
  /**
   * Current market multiplier value
   */
  currentMultiplier: number;
  
  /**
   * User's wallet balance
   */
  wallet: number;
  
  /**
   * Paused state (1 = paused, 0 = running)
   */
  paused: number;
  
  /**
   * Current resource collection progress
   */
  collections: {
    A_oranges: number;
    A_lemons: number;
    B_oranges: number;
    B_lemons: number;
  };
  
  /**
   * Active side trades
   */
  sideTrades: SideTrade[];
  
  /**
   * Multiplier history with timestamps
   */
  history: { time: number; multiplier: number }[];
  
  /**
   * Initial historical data
   */
  initialData: string;
} 