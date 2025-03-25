import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsMongoId, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  ValidateNested 
} from 'class-validator';

class SourceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsString()
  @IsOptional()
  snippet?: string;

  @IsString()
  @IsOptional()
  favicon?: string;

  @IsString()
  @IsOptional()
  host?: string;

  @IsString()
  @IsOptional()
  html?: string;
}

class VideoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  link: string;
}

export class CreateChatDto {
  @IsString()
  @IsNotEmpty({ message: 'prompt is required' })
  prompt: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'response is required' })
  response: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  sources?: SourceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoDto)
  videos?: VideoDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  followUpQuestions?: string[];

  @IsMongoId({ message: 'threadId must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'threadId is required' })
  threadId: string;
} 