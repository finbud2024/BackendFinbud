import { Controller, Post, Body, Param, Get, Req, UseGuards, Query } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { BaseController } from '../../../common/base/base.controller';
import { TradingEngineService } from '../services/trading-engine.service';
import { SimulationState } from '../interfaces/simulation-state.interface';
import { SimulationResult } from '../models/simulation-result.model';
import { TradeDto } from '../dto/trade.dto';
import {
  StartSimulationDto,
  SetDisplayTimeDto,
  SyncSimulationDto
} from '../dto/simulation-lifecycle.dto';

@Controller('trading-engine')
@UseGuards(JwtAuthGuard)
export class TradingEngineController extends BaseController {
  constructor(private readonly tradingEngineService: TradingEngineService) {
    super();
  }

  /**
   * Create a new simulation
   * @param sessionId Optional session ID (generated if not provided)
   * @returns New simulation state
   */
  @Post('simulation')
  createSimulation(
    @Req() request: Request,
    @Body() body: { sessionId?: string },
  ): SimulationState {
    // Let the service generate a proper sessionId if none is provided
    const sessionId = body.sessionId || '';
    return this.tradingEngineService.createNewSimulationForCurrentUser(request, sessionId);
  }

  /**
   * Process a trade for a simulation
   * @param sessionId Simulation session ID
   * @param body Request body containing the trade details to process
   * @returns Updated simulation state
   */
  @Post('simulation/:sessionId/trade')
  processTrade(
    @Req() request: Request,
    @Param('sessionId') sessionId: string,
    @Body() body: { trade: TradeDto },
  ): SimulationState {
    return this.tradingEngineService.processTradeForCurrentUser(
      request,
      { sessionId },
      body.trade.type,
      body.trade.action,
      body.trade.id
    );
  }

  /**
   * Calculate results for a simulation
   * @param sessionId Simulation session ID
   * @returns Simulation results
   */
  @Post('simulation/:sessionId/results')
  calculateResults(
    @Req() request: Request,
    @Param('sessionId') sessionId: string
  ): SimulationResult {
    return this.tradingEngineService.calculateResultsForCurrentUser(
      request,
      { sessionId }
    );
  }
  
  /**
   * Start a new simulation
   */
  @Post('start_simulation')
  startSimulation(
    @Req() request: Request,
    @Body() startSimulationDto: StartSimulationDto
  ): any {
    const simulation = this.tradingEngineService.startSimulationForCurrentUser(
      request, 
      { sessionId: startSimulationDto.sessionId }
    );
    
    return {
      message: 'Simulation started!',
      session_id: simulation.sessionId
    };
  }
  
  /**
   * Stop (pause) a simulation
   */
  @Post('stop_simulation/:sessionId')
  stopSimulation(
    @Req() request: Request,
    @Param('sessionId') sessionId: string
  ): any {
    this.tradingEngineService.pauseSimulationForCurrentUser(
      request,
      sessionId
    );
    
    return { message: 'Simulation paused' };
  }
  
  /**
   * Resume a simulation
   */
  @Post('resume_simulation/:sessionId')
  resumeSimulation(
    @Req() request: Request,
    @Param('sessionId') sessionId: string
  ): any {
    this.tradingEngineService.resumeSimulationForCurrentUser(
      request,
      sessionId
    );
    
    return { message: 'Simulation resumed' };
  }
  
  /**
   * Restart a simulation
   */
  @Post('restart_simulation/:sessionId')
  restartSimulation(
    @Req() request: Request,
    @Param('sessionId') sessionId: string
  ): any {
    this.tradingEngineService.restartSimulationForCurrentUser(
      request,
      sessionId
    );
    
    return { message: 'Simulation restarted' };
  }
  
  /**
   * Terminate a simulation
   */
  @Post('terminate_simulation/:sessionId')
  terminateSimulation(
    @Req() request: Request,
    @Param('sessionId') sessionId: string
  ): any {
    this.tradingEngineService.terminateSimulationForCurrentUser(
      request,
      sessionId
    );
    
    return { message: 'Simulation terminated' };
  }
  
  /**
   * Set the display time for a simulation
   */
  @Post('set_display_time/:sessionId')
  setDisplayTime(
    @Req() request: Request,
    @Param('sessionId') sessionId: string,
    @Body() setDisplayTimeDto: SetDisplayTimeDto
  ): any {
    const simulation = this.tradingEngineService.setDisplayTimeForCurrentUser(
      request,
      sessionId,
      setDisplayTimeDto.timeIndex
    );
    
    return { 
      message: 'Display time updated',
      current_time: simulation.currentTime
    };
  }
  
  /**
   * Sync the simulation with client time
   */
  @Post('sync/:sessionId')
  syncWithClient(
    @Req() request: Request,
    @Param('sessionId') sessionId: string,
    @Body() syncSimulationDto: SyncSimulationDto
  ): any {
    return this.tradingEngineService.syncWithClientForCurrentUser(
      request,
      sessionId,
      syncSimulationDto.clientTime,
      syncSimulationDto.clientDisplayedTime
    );
  }
  
  /**
   * Handle user input for trades
   */
  @Post('handle_input/:sessionId')
  handleUserInput(
    @Req() request: Request,
    @Param('sessionId') sessionId: string,
    @Body() body: { input: string }
  ): any {
    return this.tradingEngineService.handleUserInputForCurrentUser(
      request,
      sessionId,
      body.input
    );
  }
  
  /**
   * Get current simulation data
   */
  @Get('current_data/:sessionId')
  getCurrentData(
    @Req() request: Request,
    @Param('sessionId') sessionId: string,
    @Query('fields') fields?: string
  ): any {
    return this.tradingEngineService.getCurrentDataForCurrentUser(
      request,
      sessionId,
      fields
    );
  }
  
  /**
   * Get simulation data for a specific time range
   */
  @Get('time_range/:sessionId')
  getTimeRange(
    @Req() request: Request,
    @Param('sessionId') sessionId: string,
    @Query('startIndex') startIndex: number,
    @Query('endIndex') endIndex: number
  ): any {
    return this.tradingEngineService.getTimeRangeForCurrentUser(
      request,
      sessionId,
      startIndex,
      endIndex
    );
  }
  
  /**
   * Get simulation results
   */
  @Get('results/:sessionId')
  getResults(
    @Req() request: Request,
    @Param('sessionId') sessionId: string
  ): any {
    return this.tradingEngineService.getResultsForCurrentUser(
      request,
      sessionId
    );
  }
} 