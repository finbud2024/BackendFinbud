import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO for starting a new simulation
 */
export class StartSimulationDto {
  /**
   * User ID for the simulation owner
   * (populated from request)
   */
  @IsOptional()
  @IsString()
  userId?: string;
  
  /**
   * Optional custom session ID
   */
  @IsOptional()
  @IsString()
  sessionId?: string;
}

/**
 * DTO for setting the display time in a simulation
 */
export class SetDisplayTimeDto {
  /**
   * Time index to set
   */
  @IsNumber()
  @Min(0)
  timeIndex: number;
}

/**
 * DTO for synchronizing simulation data
 */
export class SyncSimulationDto {
  /**
   * Client's current time
   */
  @IsNumber()
  @Min(0)
  clientTime: number;
  
  /**
   * Client's displayed time
   */
  @IsNumber()
  @Min(0)
  clientDisplayedTime: number;
} 