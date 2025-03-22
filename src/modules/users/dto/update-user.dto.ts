import {
  IsOptional,
  ValidateNested,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// Define classes for each section that can be updated
export class UpdateAccountDataDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  priviledge?: string;

  @IsOptional()
  @IsString()
  securityQuestion?: string;

  @IsOptional()
  @IsString()
  securityAnswer?: string;
}

export class UpdateIdentityDataDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAccountDataDto)
  accountData?: UpdateAccountDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateIdentityDataDto)
  identityData?: UpdateIdentityDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSettingsDto)
  settings?: UpdateSettingsDto;
} 