import { IsString, IsOptional, IsUrl, IsNumber, Min, Max, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class GeoPoint {
  @IsString()
  type: string;

  @ValidateNested()
  @Type(() => Number)
  coordinates: number[];
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPoint)
  geoLocation?: {
    type: string;
    coordinates: number[];
  };

  @IsOptional()
  @IsUrl()
  url?: string;
} 