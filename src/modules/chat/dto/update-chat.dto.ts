import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsOptional, 
  IsString, 
  ValidateNested 
} from 'class-validator';

class SourceDto {
  @IsString()
  title: string;

  @IsString()
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
  title: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  link: string;
}

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  response?: string[];

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
} 