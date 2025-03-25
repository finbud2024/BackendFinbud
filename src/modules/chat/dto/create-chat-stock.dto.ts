import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatStockDto {
  @IsMongoId()
  @IsOptional()
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'prompt is required' })
  prompt: string;

  @IsOptional()
  @IsString()
  response?: string;
} 