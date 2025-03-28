import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { SimulationState } from '../interfaces/simulation-state.interface';
import { SideTrade } from '../models/side-trade.model';
import { SimulationResult } from '../models/simulation-result.model';
import { Trade } from '../models/trade.model';
import { TradeResult } from '../models/trade-result.model';
import { Request } from 'express';
import { BaseService } from '../../../common/base/base.service';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';
import { TradingEngineGateway } from '../gateways/trading-engine.gateway';

/**
 * Service that handles the core simulation logic for the trading engine
 */
@Injectable()
export class TradingEngineService extends BaseService<any> {
  // In-memory storage for simulations
  private sessions: Map<string, SimulationState> = new Map();
  
  constructor(
    @Inject(forwardRef(() => TradingEngineGateway))
    private readonly tradingEngineGateway: TradingEngineGateway
  ) {
    // Since we don't use repository functionality in this service, we can pass null
    super(null as any, 'SimulationState');
  }

  /**
   * Broadcasts a simulation event to all clients connected to a simulation room
   * @param sessionId The simulation session ID
   * @param eventType The type of event
   * @param data Additional data to send with the event
   */
  private broadcastSimulationEvent(
    sessionId: string, 
    eventType: string, 
    data: Record<string, any> = {}
  ): void {
    // Ensure sessionId follows the correct format (session:xyz)
    const formattedSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    // Ensure session_id is consistent with the original Node.js implementation
    if (!data.session_id) {
      data.session_id = formattedSessionId;
    }
    
    this.tradingEngineGateway.broadcastSimulationUpdate(formattedSessionId, {
      event: eventType,
      sessionId: formattedSessionId,
      timestamp: Date.now(),
      ...data
    });
    
    this.logger.debug(`Broadcasted ${eventType} event for simulation ${formattedSessionId}`);
  }

  /**
   * Creates a new simulation with initial data
   */
  createNewSimulation(userId: string, sessionId: string, options?: {
    rounds?: number;
    simulationTime?: number;
    speedMultiplier?: number;
  }): SimulationState {
    // Set defaults from options or use standard values
    const rounds = options?.rounds || 20;
    const simulationTime = options?.simulationTime || 60;
    const realTimeMultiplier = options?.speedMultiplier ? 1 / options.speedMultiplier : 1 / 6;
    
    const simulation: SimulationState = {
      sessionId,
      userId,
      rounds,
      simulationTime,
      simulationSteps: simulationTime * 2, // 30-second steps
      realTimeMultiplier,
      active: true,
      paused: false,
      trade_active: true,
      currentTime: 0,
      displayedTimeIndex: 0,
      currentMultiplier: 1,
      predictedFinalMultiplier: 1,
      teams: {
        A: { oxygen: [], lithium: [] },
        B: { oxygen: [], lithium: [] }
      },
      multiplierValues: [],
      timeValues: [],
      userTrades: [],
      sideTrades: [],
      sideTradeResults: [],
      collectionProgress: {
        A_oxygen: 0,
        A_lithium: 0,
        B_oxygen: 0,
        B_lithium: 0
      },
      resourceMeans: {
        A_oxygen_mean: 0,
        A_lithium_mean: 0,
        B_oxygen_mean: 0,
        B_lithium_mean: 0
      },
      walletBalance: 1000,
      createdAt: new Date(),
      preGeneratedData: [],
      initialData: [],
      finalCollectionProgress: {
        A_oxygen: 0,
        A_lithium: 0,
        B_oxygen: 0,
        B_lithium: 0
      },
      finalMultiplier: 1
    };

    // Generate random historical data
    this.generateRandomSamples(simulation);
    
    // Calculate resource means
    simulation.resourceMeans = this.calculateResourceMeans(simulation.collectionProgress);
    
    // Generate initial data display
    simulation.initialData = this.displayInitialData(simulation);
    
    // Generate simulation data including all timesteps
    this.generateSimulationData(simulation);
    
    this.logger.log(`Created new simulation for user ${userId}, session ${sessionId}`);
    return simulation;
  }

  /**
   * Creates a new simulation for the current user in the request
   */
  createNewSimulationForCurrentUser(
    request: Request, 
    sessionId: string, 
    options?: {
      rounds?: number;
      simulationTime?: number;
      speedMultiplier?: number;
    }
  ): SimulationState {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${userId}`;
    
    this.logger.log(`Creating new simulation for current user ${userId}, session ${fullSessionId}`);
    return this.createNewSimulation(userId, fullSessionId, options);
  }

  /**
   * Generates random samples for historical data
   */
  private generateRandomSamples(simulation: SimulationState): void {
    for (const resource of ['oxygen', 'lithium']) {
      for (const team of ['A', 'B']) {
        const meanValue = Math.floor(Math.random() * 9) + 2; // between 2-10
        const deviations = Array.from(
          { length: simulation.rounds }, 
          () => this.randomNormal(0, 2)
        );
        
        const samples = deviations.map(dev => 
          Math.max(0, Math.round(meanValue + dev))
        );
        
        simulation.teams[team][resource] = samples;
      }
    }
  }
  
  /**
   * Helper for random normal distribution
   */
  private randomNormal(mean = 0, std = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * std + mean;
  }
  
  /**
   * Calculate mean collection rates
   */
  private calculateResourceMeans(collectionProgress: {
    A_oxygen: number;
    A_lithium: number;
    B_oxygen: number;
    B_lithium: number;
  }): {
    A_oxygen_mean: number;
    A_lithium_mean: number;
    B_oxygen_mean: number;
    B_lithium_mean: number;
  } {
    // Base means for resources when collection progress is 0
    const baseMean = {
      A_oxygen: 50,
      A_lithium: 50,
      B_oxygen: 50,
      B_lithium: 50
    };

    // Calculate means based on collection progress
    // As collection progress increases, the mean increases as well
    return {
      A_oxygen_mean: baseMean.A_oxygen * (1 + collectionProgress.A_oxygen / 100),
      A_lithium_mean: baseMean.A_lithium * (1 + collectionProgress.A_lithium / 100),
      B_oxygen_mean: baseMean.B_oxygen * (1 + collectionProgress.B_oxygen / 100),
      B_lithium_mean: baseMean.B_lithium * (1 + collectionProgress.B_lithium / 100)
    };
  }
  
  /**
   * Generate human-readable initial data
   */
  private displayInitialData(simulation: SimulationState): Array<{
    round: number;
    A_oxygen: number;
    A_lithium: number;
    B_oxygen: number;
    B_lithium: number;
  }> {
    // Format historical data in an array of objects
    const dataPoints: Array<{
      round: number;
      A_oxygen: number;
      A_lithium: number;
      B_oxygen: number;
      B_lithium: number;
    }> = [];
    
    for (let i = 0; i < simulation.rounds; i++) {
      dataPoints.push({
        round: i + 1,
        A_oxygen: simulation.teams.A.oxygen[i],
        A_lithium: simulation.teams.A.lithium[i],
        B_oxygen: simulation.teams.B.oxygen[i],
        B_lithium: simulation.teams.B.lithium[i]
      });
    }
    
    return dataPoints;
  }
  
  /**
   * Pre-generate all simulation data
   */
  private generateSimulationData(simulation: SimulationState): void {
    this.logger.debug('Pre-generating simulation data');
    
    // Reset arrays
    simulation.multiplierValues = [];
    simulation.timeValues = [];
    simulation.preGeneratedData = [];
    
    const timeStep = simulation.simulationTime / simulation.simulationSteps;
    let currentMultiplier = 1.0;
    let collectionProgress = { ...simulation.collectionProgress };

    // Generate data for each simulation step
    for (let step = 0; step <= simulation.simulationSteps; step++) {
      const time = step * timeStep;
      simulation.timeValues.push(time);

      // Generate random changes for collection progress
      const progressChange = this.generateProgressChange(step, simulation.simulationSteps);
      
      // Update collection progress
      collectionProgress = {
        A_oxygen: Math.min(100, collectionProgress.A_oxygen + progressChange.A_oxygen),
        A_lithium: Math.min(100, collectionProgress.A_lithium + progressChange.A_lithium),
        B_oxygen: Math.min(100, collectionProgress.B_oxygen + progressChange.B_oxygen),
        B_lithium: Math.min(100, collectionProgress.B_lithium + progressChange.B_lithium)
      };

      // Calculate multiplier based on collection progress
      currentMultiplier = this.calculateMultiplier(collectionProgress);
      simulation.multiplierValues.push(currentMultiplier);

      // Generate random side trades for 20% of steps
      const sideTrades = Math.random() < 0.2 ? this.generateSideTrades(time) : [];

      // Add pre-generated data
      simulation.preGeneratedData.push({
        time,
        multiplier: currentMultiplier,
        predictedMultiplier: currentMultiplier * 1.1, // Simple prediction model
        collections: { ...collectionProgress },
        sideTrades: sideTrades
      });
    }

    // Save final collection progress and multiplier
    simulation.finalCollectionProgress = { ...collectionProgress };
    simulation.finalMultiplier = currentMultiplier;
    
    this.logger.debug(`Pre-generated simulation data. Final multiplier: ${simulation.finalMultiplier}`);
  }

  /**
   * Generates random changes in collection progress
   */
  private generateProgressChange(step: number, totalSteps: number): Record<string, number> {
    // Progress change depends on the simulation step
    // Early steps have smaller changes, later steps have larger changes
    const progressFactor = Math.pow(step / totalSteps, 0.5); // Non-linear progression
    
    // Base change values
    const baseChange = {
      A_oxygen: 0.5,
      A_lithium: 0.5,
      B_oxygen: 0.5,
      B_lithium: 0.5
    };

    // Generate random changes scaled by progress factor
    return {
      A_oxygen: baseChange.A_oxygen * progressFactor * (0.5 + Math.random()),
      A_lithium: baseChange.A_lithium * progressFactor * (0.5 + Math.random()),
      B_oxygen: baseChange.B_oxygen * progressFactor * (0.5 + Math.random()),
      B_lithium: baseChange.B_lithium * progressFactor * (0.5 + Math.random())
    };
  }

  /**
   * Calculates multiplier based on collection progress
   */
  private calculateMultiplier(collectionProgress: {
    A_oxygen: number;
    A_lithium: number;
    B_oxygen: number;
    B_lithium: number;
  }): number {
    // Base multiplier
    const baseMultiplier = 1.0;
    
    // Weights for different resources
    const weights = {
      A_oxygen: 0.2,
      A_lithium: 0.3,
      B_oxygen: 0.2,
      B_lithium: 0.3
    };

    // Calculate weighted average of collection progress
    const weightedProgress = 
      weights.A_oxygen * collectionProgress.A_oxygen / 100 +
      weights.A_lithium * collectionProgress.A_lithium / 100 +
      weights.B_oxygen * collectionProgress.B_oxygen / 100 +
      weights.B_lithium * collectionProgress.B_lithium / 100;
    
    // Final multiplier calculation
    // As weightedProgress increases, the multiplier increases
    // Maximum multiplier is 2.0 when all collections are at 100%
    return baseMultiplier + weightedProgress;
  }

  /**
   * Generates random side trades for a time step
   */
  private generateSideTrades(time: number): Trade[] {
    const sideTrades: Trade[] = [];
    const numTrades = Math.floor(Math.random() * 3) + 1; // 1 to 3 trades
    
    for (let i = 0; i < numTrades; i++) {
      // Generate random trade parameters
      const action = Math.random() < 0.5 ? 'b' : 's';
      const value = 0.8 + Math.random() * 0.4; // Value between 0.8 and 1.2
      const id = Math.floor(Math.random() * 10000);
      
      // Create new side trade
      sideTrades.push(new Trade({
        type: 's',
        action,
        value,
        time,
        id
      }));
    }
    
    return sideTrades;
  }

  /**
   * Generate a side trade expression
   * This matches the logic in the original multiplierSimulator.js
   */
  private generateSideTrade(
    meanAOxygen: number, 
    meanALithium: number, 
    meanBOxygen: number, 
    meanBLithium: number,
    currentTime: number,
    simulationTime: number
  ): SideTrade {
    // Expressions from the original implementation
    const expressions = [
      "A_oxygen",
      "A_lithium",
      "B_oxygen",
      "B_lithium",
      "A_oxygen + B_oxygen",
      "A_oxygen + B_lithium",
      "A_lithium + B_oxygen",
      "A_lithium + B_lithium",
      "A_oxygen + 2 * B_oxygen",
      "A_oxygen + 2 * B_lithium",
      "A_lithium + 2 * B_oxygen",
      "A_lithium + 2 * B_lithium",
      "A_oxygen * B_oxygen",
      "A_oxygen * B_lithium",
      "A_lithium * B_oxygen",
      "A_lithium * B_lithium"
    ];
    
    // Select random expression
    const expression = expressions[Math.floor(Math.random() * expressions.length)];
    
    // Calculate expiry time (5-15 minute range)
    const expiryTime = Math.min(
      currentTime + Math.floor(Math.random() * 11) + 5, 
      simulationTime
    );
    
    // Calculate predicted value
    let predictedValue: number;
    try {
      predictedValue = this.safeEval(expression, {
        A_oxygen: meanAOxygen,
        A_lithium: meanALithium,
        B_oxygen: meanBOxygen,
        B_lithium: meanBLithium
      });
    } catch (error) {
      this.logger.error('Error evaluating side trade expression:', error);
      predictedValue = 20; // Fallback
    }
    
    // Set price with small variation
    const tradePrice = Math.round(predictedValue * (Math.random() * 0.1 + 0.95));
    
    // Generate unique ID
    const tradeId = Math.floor(Math.random() * 10000) + 1;
    
    return new SideTrade({
      id: tradeId,
      expression,
      price: tradePrice,
      expiry: expiryTime
    });
  }
  
  /**
   * Safely evaluate mathematical expressions for side trades without using eval
   * @param expr The expression to evaluate 
   * @param vars Variables to substitute in the expression
   * @returns The calculated result
   */
  private safeEval(expr: string, vars: Record<string, number>): number {
    try {
      // Replace variable names with their values
      let jsExpr = expr;
      
      // Replace variables with their values
      for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        jsExpr = jsExpr.replace(regex, value.toString());
      }
      
      // Simple expression parser for basic arithmetic
      // This supports: +, -, *, /, and constants
      const tokens = jsExpr.match(/(\d+\.?\d*|\+|\-|\*|\/|\(|\))/g) || [];
      
      // Simple implementation for basic expressions
      // For complex expressions, this could be replaced with a proper math parser library
      const calculate = (tokens: string[]): number => {
        if (tokens.length === 0) return 0;
        if (tokens.length === 1) return parseFloat(tokens[0]);
        
        // Handle basic operations
        let result = parseFloat(tokens[0]);
        let op = '+';
        
        for (let i = 1; i < tokens.length; i++) {
          const token = tokens[i];
          
          if (['+', '-', '*', '/'].includes(token)) {
            op = token;
          } else {
            const value = parseFloat(token);
            
            switch (op) {
              case '+': result += value; break;
              case '-': result -= value; break;
              case '*': result *= value; break;
              case '/': result /= value; break;
            }
          }
        }
        
        return result;
      };
      
      return calculate(tokens);
    } catch (error) {
      this.logger.error(`Error evaluating expression: ${expr}`, error);
      return 0;
    }
  }
  
  /**
   * Processes a trade and updates the simulation state
   */
  processTrade(
    simulation: SimulationState, 
    type: 'm' | 's', 
    action: 'b' | 's', 
    id?: number
  ): boolean {
    if (!simulation.active || !simulation.trade_active) {
      this.logger.debug('Cannot process trade - simulation not active');
      return false;
    }
    
    try {
      if (type === 'm') {
        // Market trade - trading directly on the market multiplier
        const tradeValue = simulation.currentMultiplier;
        
        // Add the trade to user trades
        simulation.userTrades.push(new Trade({
          type,
          action,
          value: tradeValue,
          time: simulation.currentTime
        }));
        
        // Update wallet - buy means deduct money, sell means add money
        if (action === 'b') {
          simulation.walletBalance -= 100; // Fixed investment amount
        } else {
          simulation.walletBalance += 100 * tradeValue;
        }
        
        this.logger.debug(`Processed market ${action === 'b' ? 'buy' : 'sell'} at ${tradeValue}`);
        return true;
      } 
      else if (type === 's' && id !== undefined) {
        // Side trade - trading on a specific expression with a fixed price
        const sideTrade = simulation.sideTrades.find(t => t.id === id);
        
        if (!sideTrade) {
          this.logger.debug(`Side trade with id ${id} not found`);
          return false;
        }
        
        // Add the trade to user trades
        simulation.userTrades.push(new Trade({
          type,
          action,
          value: sideTrade.value,
          time: simulation.currentTime,
          id
        }));
        
        // Update wallet based on trade parameters
        if (action === 'b') {
          simulation.walletBalance -= 100 * sideTrade.value;
        } else {
          simulation.walletBalance += 100 * sideTrade.value * simulation.currentMultiplier;
        }
        
        // Remove the trade from available side trades
        simulation.sideTrades = simulation.sideTrades.filter(t => t.id !== id);
        
        this.logger.debug(`Processed side trade ${action === 'b' ? 'buy' : 'sell'} with id ${id}`);
        return true;
      }
      
      return false;
    } 
    catch (error) {
      this.logger.error('Error processing trade:', error);
      return false;
    }
  }
  
  /**
   * Process a trade for the current user's simulation
   * @param request Express request
   * @param simulationOrId The simulation state or session ID
   * @param tradeType The trade type (market or side)
   * @param action The trade action (buy or sell)
   * @param sideTradeId Optional ID for side trades
   */
  processTradeForCurrentUser(
    request: Request,
    simulationOrId: SimulationState | { sessionId: string },
    tradeType: 'm' | 's',
    action: 'b' | 's',
    sideTradeId?: number
  ): SimulationState {
    const userId = this.getUserIdFromRequest(request);
    
    // Handle case where only sessionId is provided
    let simulation: SimulationState;
    if ('sessionId' in simulationOrId && !('userId' in simulationOrId)) {
      // This is just a sessionId wrapper, get the full simulation
      const sessionId = simulationOrId.sessionId;
      this.logger.log(`Retrieving simulation for processing trade: ${sessionId}`);
      simulation = this.getOrCreateSimulation(userId, sessionId);
    } else {
      // Full simulation object was provided
      simulation = simulationOrId as SimulationState;
    }
    
    // Ensure sessionId follows the correct format
    if (!simulation.sessionId.startsWith('session:')) {
      this.logger.warn(`Session ID format incorrect: ${simulation.sessionId}. Formatting session ID.`);
      simulation.sessionId = `session:${userId}`;
    }
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', simulation.sessionId);
    
    // Process the trade
    const success = this.processTrade(simulation, tradeType, action, sideTradeId);
    
    // Broadcast the trade
    this.broadcastSimulationEvent(simulation.sessionId, 'trade-processed', {
      trade_type: tradeType,
      action: action,
      side_trade_id: sideTradeId,
      wallet_balance: simulation.walletBalance,
      current_multiplier: simulation.currentMultiplier,
      current_time: simulation.currentTime
    });
    
    // Save the updated simulation
    this.saveSimulation(simulation);
    
    return simulation;
  }
  
  /**
   * Calculates final results of the simulation
   */
  calculateResults(simulation: SimulationState): SimulationResult {
    const finalMultiplier = simulation.finalMultiplier;
    
    // Calculate profits from all trades
    let netProfit = 0;
    const tradeResults: TradeResult[] = [];
    
    // Process each user trade
    for (const trade of simulation.userTrades) {
      let profit = 0;
      let actualValue = 0;
      
      if (trade.type === 'm') {
        // Market trade - uses final multiplier to determine profit
        actualValue = finalMultiplier;
        
        // Calculate profit based on action type
        if (trade.action === 'b') {
          // For buys, profit is based on difference between final and buy value
          profit = 100 * (finalMultiplier - trade.value);
        } else {
          // For sells, profit is based on difference between sell value and final
          profit = 100 * (trade.value - finalMultiplier);
        }
      } 
      else if (trade.type === 's' && trade.id !== undefined) {
        // For side trades, use the current multiplier at time of evaluation
        actualValue = simulation.currentMultiplier;
        
        if (trade.action === 'b') {
          profit = 100 * trade.value * (simulation.currentMultiplier - 1);
        } else {
          profit = 100 * trade.value * (1 - simulation.currentMultiplier);
        }
      }
      
      // Add to net profit
      netProfit += profit;
      
      // Create trade result
      const tradeResult = new TradeResult({
        type: trade.type,
        action: trade.action,
        value: trade.value,
        time: trade.time,
        id: trade.id,
        actualValue,
        profit
      });
      
      tradeResults.push(tradeResult);
    }
    
    // Final wallet balance includes initial balance plus net profit
    const finalWallet = simulation.walletBalance + netProfit;
    
    // Create simulation result
    return new SimulationResult({
      simulationId: simulation.sessionId,
      userId: simulation.userId,
      finalMultiplier,
      netProfit,
      tradeResults,
      multiplierHistory: simulation.multiplierValues,
      finalWallet,
      completedAt: new Date()
    });
  }
  
  /**
   * Calculate results for the current user's simulation
   * @param request Express request 
   * @param simulationOrId Simulation state or object with sessionId
   */
  calculateResultsForCurrentUser(
    request: Request, 
    simulationOrId: SimulationState | { sessionId: string }
  ): SimulationResult {
    const userId = this.getUserIdFromRequest(request);
    
    // Handle case where only sessionId is provided
    let simulation: SimulationState;
    if ('sessionId' in simulationOrId && !('userId' in simulationOrId)) {
      // This is just a sessionId wrapper, get the full simulation
      const sessionId = simulationOrId.sessionId;
      this.logger.log(`Retrieving simulation for calculating results: ${sessionId}`);
      simulation = this.getOrCreateSimulation(userId, sessionId);
    } else {
      // Full simulation object was provided
      simulation = simulationOrId as SimulationState;
    }
    
    // Validate ownership 
    this.validateEntityOwnership(simulation, userId, 'Simulation', simulation.sessionId);
    
    this.logger.log(`Calculating results for user ${userId}, simulation ${simulation.sessionId}`);
    return this.calculateResults(simulation);
  }
  
  /**
   * Updates the current time index in the simulation
   */
  updateTimeIndex(simulation: SimulationState, index: number): void {
    if (index < 0 || index >= simulation.preGeneratedData.length) {
      this.logger.warn(`Invalid time index: ${index}`);
      return;
    }
    
    simulation.displayedTimeIndex = index;
    const timeData = simulation.preGeneratedData[index];
    
    simulation.currentTime = timeData.time;
    simulation.currentMultiplier = timeData.multiplier;
    simulation.predictedFinalMultiplier = timeData.predictedMultiplier;
    
    // Update available side trades
    simulation.sideTrades = [...timeData.sideTrades];
    
    this.logger.debug(`Updated time index to ${index}, time=${simulation.currentTime}, multiplier=${simulation.currentMultiplier}`);
  }
  
  /**
   * Starts a simulation
   */
  startSimulation(simulation: SimulationState): void {
    simulation.active = true;
    simulation.trade_active = true;
    simulation.paused = false;
    this.logger.debug(`Simulation ${simulation.sessionId} started`);
    // Broadcasting is handled by the caller
  }
  
  /**
   * Pauses a simulation
   */
  pauseSimulation(simulation: SimulationState): void {
    simulation.paused = true;
    this.logger.debug(`Simulation ${simulation.sessionId} paused at time ${simulation.currentTime}`);
    // Broadcasting is handled by the caller
  }
  
  /**
   * Resumes a simulation
   */
  resumeSimulation(simulation: SimulationState): void {
    simulation.paused = false;
    this.logger.debug(`Simulation ${simulation.sessionId} resumed at time ${simulation.currentTime}`);
    // Broadcasting is handled by the caller
  }
  
  /**
   * Finishes a simulation
   */
  finishSimulation(simulation: SimulationState): void {
    simulation.active = false;
    simulation.trade_active = false;
    this.logger.debug(`Simulation ${simulation.sessionId} finished`);
    // Broadcasting is handled by the caller
  }
  
  /**
   * Terminates a simulation
   */
  terminateSimulation(simulation: SimulationState): void {
    simulation.active = false;
    simulation.trade_active = false;
    this.logger.debug(`Simulation ${simulation.sessionId} terminated at time ${simulation.currentTime}`);
    // Broadcasting is handled by the caller
  }
  
  /**
   * Get the current data from a simulation
   */
  getCurrentData(simulation: SimulationState): any {
    // Basic data format for API response - matching the original JS implementation
    return {
      current_time: simulation.currentTime,
      current_multiplier: simulation.currentMultiplier,
      wallet: simulation.walletBalance,
      paused: simulation.paused ? 1 : 0,
      side_trades: simulation.sideTrades,
      collections: {
        A_oranges: simulation.collectionProgress.A_oxygen,
        A_lemons: simulation.collectionProgress.A_lithium,
        B_oranges: simulation.collectionProgress.B_oxygen,
        B_lemons: simulation.collectionProgress.B_lithium
      },
      history: simulation.multiplierValues.map((multiplier, index) => ({
        time: simulation.timeValues[index],
        multiplier
      })),
      initial_data: simulation.initialData
    };
  }
  
  /**
   * Get a specific time range from the simulation data
   */
  getTimeRange(simulation: SimulationState, startIndex: number, endIndex: number): any {
    // Validate indices
    const maxIndex = simulation.preGeneratedData.length - 1;
    startIndex = Math.max(0, Math.min(startIndex, maxIndex));
    endIndex = Math.max(startIndex, Math.min(endIndex, maxIndex));
    
    // Extract the time range
    const range = simulation.preGeneratedData.slice(startIndex, endIndex + 1);
    
    return {
      startIndex,
      endIndex,
      data: range.map(point => ({
        time: point.time,
        multiplier: point.multiplier,
        predictedMultiplier: point.predictedMultiplier,
        collections: point.collections,
        sideTrades: point.sideTrades
      }))
    };
  }
  
  /**
   * Synchronize the simulation with client time
   */
  syncWithClient(
    simulation: SimulationState, 
    clientTime: number, 
    clientDisplayedTime: number
  ): any {
    // Find the appropriate time index
    const serverTimeIndex = simulation.timeValues.findIndex(time => time >= clientTime);
    const serverDisplayedIndex = simulation.timeValues.findIndex(time => time >= clientDisplayedTime);
    
    // Update simulation if times differ significantly
    if (Math.abs(simulation.currentTime - clientTime) > 0.5) {
      this.updateTimeIndex(simulation, serverTimeIndex !== -1 ? serverTimeIndex : 0);
    }
    
    return {
      serverTime: simulation.currentTime,
      serverDisplayedTime: simulation.timeValues[serverDisplayedIndex] || 0,
      serverDisplayedIndex: serverDisplayedIndex !== -1 ? serverDisplayedIndex : 0,
      serverTimeIndex: serverTimeIndex !== -1 ? serverTimeIndex : 0,
      totalTimeSteps: simulation.timeValues.length
    };
  }
  
  /**
   * Get the simulation results
   */
  getResults(simulation: SimulationState): any {
    // Calculate results if not already calculated
    if (!simulation.active && simulation.currentTime >= simulation.simulationTime) {
      // Convert to a simpler format for the API response
      return {
        wallet: simulation.walletBalance,
        net_profit: 0, // Calculate from trades if needed
        final_wallet: simulation.walletBalance,
        final_multiplier: simulation.finalMultiplier
      };
    }
    
    return {
      error: 'Simulation still in progress'
    };
  }
  
  /**
   * Handle text-based user input for trades
   */
  handleUserInput(simulation: SimulationState, input: string): any {
    if (!simulation.active || !simulation.trade_active) {
      return { error: 'Simulation not active' };
    }
    
    try {
      const tradeInput = input.split(" ").map(x => x.replace(/\s+/g, ""));
      
      if (tradeInput.length >= 2 && 
          ['m', 's'].includes(tradeInput[0]) && 
          ['b', 's'].includes(tradeInput[1])) {
            
        if (tradeInput[0] === "m") {
          // Process market trade
          const success = this.processTrade(
            simulation, 
            tradeInput[0] as 'm', 
            tradeInput[1] as 'b' | 's'
          );
          
          return { 
            success, 
            message: `Market ${tradeInput[1] === 'b' ? 'buy' : 'sell'} at ${simulation.currentMultiplier}` 
          };
        }
        
        if (tradeInput[0] === "s" && tradeInput.length === 3) {
          const id = parseInt(tradeInput[2]);
          const sideTrade = simulation.sideTrades.find(t => t.id === id);
          
          if (!sideTrade) {
            return { error: `Side trade with ID ${id} not found or expired` };
          }
          
          // Process side trade
          const success = this.processTrade(
            simulation, 
            tradeInput[0] as 's', 
            tradeInput[1] as 'b' | 's',
            id
          );
          
          return { 
            success, 
            message: `Side trade ${tradeInput[1] === 'b' ? 'buy' : 'sell'} for trade ID ${id}` 
          };
        }
      }
      
      return { error: 'Invalid trade format. Use "m b" for market buy or "s b 123" for side trade buy with ID 123' };
    } catch (error) {
      this.logger.error("Input error:", error);
      return { error: error.message };
    }
  }
  
  // Lifecycle methods with current user validation
  
  /**
   * Start a simulation for the current user
   * @param request Express request
   * @param options Simulation options
   */
  startSimulationForCurrentUser(request: Request, options?: {
    sessionId?: string;
    rounds?: number;
    simulationTime?: number;
    speedMultiplier?: number;
  }): SimulationState {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: session:userId
    const sessionId = options?.sessionId || `session:${userId}`;
    
    this.logger.log(`Creating new simulation for ${sessionId}`);
    
    // Terminate existing simulation if any - matching original Node.js behavior
    const existingSimulation = this.getSimulationBySessionId(sessionId);
    if (existingSimulation) {
      this.terminateSimulation(existingSimulation);
    }
    
    // Create a new simulation
    const simulation = this.createNewSimulation(userId, sessionId, {
      rounds: options?.rounds,
      simulationTime: options?.simulationTime,
      speedMultiplier: options?.speedMultiplier
    });
    
    // Save the simulation to our in-memory sessions map
    this.saveSimulation(simulation);
    
    // Start the simulation using the dedicated method
    this.startSimulation(simulation);
    
    // Broadcast that simulation has started
    this.broadcastSimulationEvent(sessionId, 'simulation-started');
    
    return simulation;
  }
  
  /**
   * Get a simulation by session ID
   * This retrieves the simulation from the in-memory sessions map
   */
  private getSimulationBySessionId(sessionId: string): SimulationState | null {
    // Ensure the sessionId has the correct format before lookup
    const formattedSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    return this.sessions.get(formattedSessionId) || null;
  }
  
  /**
   * Save a simulation to the in-memory sessions map
   */
  private saveSimulation(simulation: SimulationState): void {
    // Ensure the sessionId has the correct format before saving
    if (!simulation.sessionId.startsWith('session:')) {
      this.logger.warn(`Correcting session ID format from ${simulation.sessionId} to session:${simulation.sessionId}`);
      simulation.sessionId = `session:${simulation.sessionId}`;
    }
    
    this.sessions.set(simulation.sessionId, simulation);
    this.logger.debug(`Saved simulation ${simulation.sessionId} to session storage`);
  }
  
  /**
   * Get an existing simulation or create a new one if it doesn't exist
   * This mimics the getOrCreateSimulation function from the original Node.js implementation
   */
  private getOrCreateSimulation(userId: string, sessionId: string): SimulationState {
    // Ensure the sessionId has the correct format
    const formattedSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    // Try to get existing simulation
    let simulation = this.getSimulationBySessionId(formattedSessionId);
    
    // If it doesn't exist, create a new one
    if (!simulation) {
      this.logger.log(`Simulation ${formattedSessionId} not found - creating new one for user ${userId}`);
      simulation = this.createNewSimulation(userId, formattedSessionId);
      this.saveSimulation(simulation);
    }
    
    return simulation;
  }
  
  /**
   * Pause a simulation for the current user
   * @param request Express request
   * @param sessionId Simulation session ID
   */
  pauseSimulationForCurrentUser(request: Request, sessionId: string): SimulationState {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Pausing simulation for user ${userId}, session ${fullSessionId}`);
    
    // Get an existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    // Pause the simulation
    this.pauseSimulation(simulation);
    
    // Broadcast paused event with additional data matching original implementation
    this.broadcastSimulationEvent(fullSessionId, 'simulation-paused', {
      current_time: simulation.currentTime
    });
    
    return simulation;
  }
  
  /**
   * Resume a simulation for the current user
   * @param request Express request
   * @param sessionId Simulation session ID
   */
  resumeSimulationForCurrentUser(request: Request, sessionId: string): SimulationState {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Resuming simulation for user ${userId}, session ${fullSessionId}`);
    
    // Get an existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    // Resume the simulation
    this.resumeSimulation(simulation);
    
    // Broadcast resumed event with additional data
    this.broadcastSimulationEvent(fullSessionId, 'simulation-resumed', {
      current_time: simulation.currentTime
    });
    
    return simulation;
  }
  
  /**
   * Restart a simulation for the current user
   * @param request Express request
   * @param sessionId Simulation session ID
   */
  restartSimulationForCurrentUser(request: Request, sessionId: string): SimulationState {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Restarting simulation for user ${userId}, session ${fullSessionId}`);
    
    // In the original Node.js code, restart just creates a new simulation with the same ID
    return this.startSimulationForCurrentUser(request, { sessionId: fullSessionId });
  }
  
  /**
   * Terminate a simulation for the current user
   * @param request Express request
   * @param sessionId Simulation session ID
   */
  terminateSimulationForCurrentUser(request: Request, sessionId: string): void {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Terminating simulation for user ${userId}, session ${fullSessionId}`);
    
    // Get the simulation if it exists
    const simulation = this.getSimulationBySessionId(fullSessionId);
    if (simulation) {
      // Validate ownership
      this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
      
      // Terminate the simulation
      this.terminateSimulation(simulation);
      
      // Broadcast terminated event
      this.broadcastSimulationEvent(fullSessionId, 'simulation-terminated', {
        current_time: simulation.currentTime
      });
      
      // Remove from sessions map
      this.sessions.delete(fullSessionId);
    }
  }
  
  /**
   * Set the displayed time index for the current user's simulation
   * @param request Express request
   * @param sessionId Simulation session ID
   * @param timeIndex Time index to set
   */
  setDisplayTimeForCurrentUser(request: Request, sessionId: string, timeIndex: number): SimulationState {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Setting display time for user ${userId}, session ${fullSessionId}, time index ${timeIndex}`);
    
    // Get an existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    // Update time index
    this.updateTimeIndex(simulation, timeIndex);
    
    // Broadcast time update event
    this.broadcastSimulationEvent(fullSessionId, 'display-time-updated', {
      time_index: timeIndex,
      current_time: simulation.currentTime
    });
    
    // Save the updated simulation
    this.saveSimulation(simulation);
    
    return simulation;
  }
  
  /**
   * Synchronize the simulation with client time for the current user
   * @param request Express request
   * @param sessionId Simulation session ID
   * @param clientTime Client's current time
   * @param clientDisplayedTime Client's displayed time
   */
  syncWithClientForCurrentUser(
    request: Request, 
    sessionId: string, 
    clientTime: number, 
    clientDisplayedTime: number
  ): any {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Syncing client time for user ${userId}, session ${fullSessionId}`);
    
    // Get an existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    // Sync with client
    const syncResult = this.syncWithClient(simulation, clientTime, clientDisplayedTime);
    
    // Broadcast sync event
    this.broadcastSimulationEvent(fullSessionId, 'client-sync', {
      client_time: clientTime,
      client_displayed_time: clientDisplayedTime,
      server_time: syncResult.serverTime
    });
    
    // Save the updated simulation
    this.saveSimulation(simulation);
    
    return syncResult;
  }
  
  /**
   * Get current data for the current user's simulation
   * @param request Express request
   * @param sessionId Simulation session ID
   * @param fields Optional comma-separated list of fields to include
   */
  getCurrentDataForCurrentUser(request: Request, sessionId: string, fields?: string): any {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Getting current data for user ${userId}, session ${fullSessionId}`);
    
    // Get existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // If simulation is not active, start it
    if (!simulation.active) {
      this.logger.log(`Simulation ${fullSessionId} not active - starting it`);
      this.startSimulation(simulation);
      
      // Since we're implicitly starting, broadcast this too
      this.broadcastSimulationEvent(fullSessionId, 'simulation-started');
      
      // Save the updated simulation
      this.saveSimulation(simulation);
    }
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    // Get the current data
    const fullData = this.getCurrentData(simulation);
    
    // Always include timing information
    fullData.server_timestamp = Date.now();
    
    // Broadcast update via WebSocket
    this.broadcastSimulationEvent(fullSessionId, 'simulation-data-update', {
      ...fullData,
      type: 'current_data'
    });
    
    return fullData;
  }
  
  /**
   * Get time range data for the current user's simulation
   * @param request Express request
   * @param sessionId Simulation session ID
   * @param startIndex Start index of time range
   * @param endIndex End index of time range
   */
  getTimeRangeForCurrentUser(request: Request, sessionId: string, startIndex: number, endIndex: number): any {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Getting time range for user ${userId}, session ${fullSessionId}, range ${startIndex}-${endIndex}`);
    
    // Get an existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    return this.getTimeRange(simulation, startIndex, endIndex);
  }
  
  /**
   * Handle text-based input for the current user's simulation
   * @param request Express request
   * @param sessionId Simulation session ID
   * @param input User input text
   */
  handleUserInputForCurrentUser(request: Request, sessionId: string, input: string): any {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Handling user input for user ${userId}, session ${fullSessionId}, input: ${input}`);
    
    // Get an existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    // Process the input
    const result = this.handleUserInput(simulation, input);
    
    // Save the updated simulation
    this.saveSimulation(simulation);
    
    return result;
  }
  
  /**
   * Get results for the current user's simulation
   * @param request Express request
   * @param sessionId Simulation session ID
   */
  getResultsForCurrentUser(request: Request, sessionId: string): any {
    const userId = this.getUserIdFromRequest(request);
    // Match original format: prepend 'session:' if not already there
    const fullSessionId = sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`;
    
    this.logger.log(`Getting results for user ${userId}, session ${fullSessionId}`);
    
    // Get an existing simulation or create a new one
    const simulation = this.getOrCreateSimulation(userId, fullSessionId);
    
    // Validate ownership
    this.validateEntityOwnership(simulation, userId, 'Simulation', fullSessionId);
    
    return this.getResults(simulation);
  }
} 