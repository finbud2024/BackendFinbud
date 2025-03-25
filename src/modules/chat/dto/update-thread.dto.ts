import { IsOptional, IsString } from 'class-validator';

export class UpdateThreadDto {
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  title?: string;
} 