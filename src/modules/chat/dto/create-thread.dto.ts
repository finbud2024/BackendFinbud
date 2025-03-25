import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateThreadDto {
  @IsMongoId({ message: 'userId must be a valid MongoDB ObjectId' })
  userId: string;

  @IsOptional()
  @IsString({ message: 'title must be a string' })
  title?: string;
} 