import { IsString, IsNumber, IsDate, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class UpdateGoalDto {
  @IsMongoId()
  @IsOptional()
  userId?: string | Types.ObjectId;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  targetAmount?: number;

  @IsNumber()
  @IsOptional()
  currentAmount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isAchieved?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
} 