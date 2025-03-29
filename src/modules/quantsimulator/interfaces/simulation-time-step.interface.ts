import { SideTrade } from '../models/side-trade.model';

/**
 * Represents a single time step in the simulation
 */
export interface SimulationTimeStep {
  // Time in simulation minutes
  time: number;
  
  // Market multiplier value at this time step
  multiplier: number;
  
  // Predicted market multiplier
  predictedMultiplier: number;
  
  // Collections at this time step
  collections: {
    A_oranges: number;
    A_lemons: number;
    B_oranges: number;
    B_lemons: number;
  };
  
  // Active side trades at this time step
  sideTrades: SideTrade[];
} 