import { 
  IsBoolean, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  Max, 
  Min 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryDto {
  @IsString()
  @IsNotEmpty({ message: 'prompt is required' })
  prompt: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  returnSources?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  numberOfPagesToScan?: number = 4;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  returnFollowUpQuestions?: boolean = true;

  @IsOptional()
  @IsString()
  threadId?: string;
} 