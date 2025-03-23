import { IsString, IsNumber, IsNotEmpty, IsDate, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateGoalDto {
  @IsMongoId()
  @IsOptional()
  userId?: string | Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  targetAmount: number;

  @IsNumber()
  @IsOptional()
  currentAmount?: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  isAchieved?: boolean;

  @IsString()
  @IsNotEmpty()
  category: string;
} 