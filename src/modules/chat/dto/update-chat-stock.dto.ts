import { IsOptional, IsString } from 'class-validator';

export class UpdateChatStockDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  response?: string;
} 