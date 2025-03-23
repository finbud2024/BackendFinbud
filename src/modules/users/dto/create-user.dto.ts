import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AccountDataDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(['admin', 'user'])
  priviledge?: string;

  @IsOptional()
  @IsString()
  securityQuestion?: string;

  @IsOptional()
  @IsString()
  securityAnswer?: string;
}

class IdentityDataDto {
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

class BankingAccountDataDto {
  @IsOptional()
  @IsNumber()
  accountBalance?: number;

  @IsOptional()
  @IsNumber()
  stockValue?: number;

  @IsOptional()
  @IsNumber()
  cash?: number;
}

class SettingsDto {
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;
}

export class CreateUserDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AccountDataDto)
  accountData: AccountDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IdentityDataDto)
  identityData?: IdentityDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankingAccountDataDto)
  bankingAccountData?: BankingAccountDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
  settings?: SettingsDto;
} 