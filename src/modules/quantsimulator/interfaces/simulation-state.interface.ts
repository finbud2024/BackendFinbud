import { Trade } from '../models/trade.model';
import { TradeResult } from '../models/trade-result.model';

/**
 * Interface representing a simulation state
 */
export interface SimulationState {
  // Identifiers
  sessionId: string;
  userId: string;
  
  // Status
  active: boolean;
  paused: boolean;
  trade_active: boolean;
  
  // Configuration
  rounds: number;
  simulationTime: number;
  simulationSteps: number;
  realTimeMultiplier: number;
  
  // Current state
  currentTime: number;
  displayedTimeIndex: number;
  currentMultiplier: number;
  predictedFinalMultiplier: number;
  
  // Resources
  teams: {
    A: { 
      oxygen: number[], 
      lithium: number[] 
    },
    B: { 
      oxygen: number[], 
      lithium: number[] 
    }
  };
  
  // Collection progress
  collectionProgress: {
    A_oxygen: number;
    A_lithium: number;
    B_oxygen: number;
    B_lithium: number;
  };
  
  // Final collection progress
  finalCollectionProgress: {
    A_oxygen: number;
    A_lithium: number;
    B_oxygen: number;
    B_lithium: number;
  };
  
  // Resource means (average collection rates)
  resourceMeans: {
    A_oxygen_mean: number;
    A_lithium_mean: number;
    B_oxygen_mean: number;
    B_lithium_mean: number;
  };
  
  // Market data
  multiplierValues: number[];
  timeValues: number[];
  
  // Trades
  userTrades: Trade[];
  sideTrades: Trade[];
  sideTradeResults: TradeResult[];
  
  // Wallet
  walletBalance: number;
  
  // Pre-generated data
  preGeneratedData: Array<{
    time: number;
    multiplier: number;
    predictedMultiplier: number;
    collections: {
      A_oxygen: number;
      A_lithium: number;
      B_oxygen: number;
      B_lithium: number;
    };
    sideTrades: Trade[];
  }>;
  
  // Metadata
  createdAt: Date;
  initialData: Array<{
    round: number;
    A_oxygen: number;
    A_lithium: number;
    B_oxygen: number;
    B_lithium: number;
  }>;
  
  // Final results
  finalMultiplier: number;
} 