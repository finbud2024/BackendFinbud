import { IsNumber, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for creating a new simulation
 */
export class CreateSimulationDto {
  /**
   * Number of historical rounds (default: 20)
   */
  @IsNumber()
  @IsOptional()
  rounds?: number;
  
  /**
   * Simulation duration in minutes (default: 60)
   */
  @IsNumber()
  @IsOptional()
  simulationTime?: number;
  
  /**
   * Real-time speed multiplier (default: 6)
   * Higher values make the simulation run faster
   */
  @IsNumber()
  @IsOptional()
  speedMultiplier?: number;
} 