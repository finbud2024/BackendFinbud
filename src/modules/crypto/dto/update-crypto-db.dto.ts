import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CryptoApiMetaData {
  @IsNotEmpty()
  '2. Digital Currency Code': string;

  @IsNotEmpty()
  '3. Digital Currency Name': string;
}

class CryptoApiTimeSeriesData {
  @IsNotEmpty()
  '1. open': string;

  @IsNotEmpty()
  '2. high': string;

  @IsNotEmpty()
  '3. low': string;

  @IsNotEmpty()
  '4. close': string;

  @IsNotEmpty()
  '5. volume': string;
}

class CryptoApiResponse {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CryptoApiMetaData)
  'Meta Data': CryptoApiMetaData;

  @IsNotEmpty()
  'Time Series (Digital Currency Daily)': Record<string, CryptoApiTimeSeriesData>;
}

export class UpdateCryptoDbDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CryptoApiResponse)
  cryptoResponses: CryptoApiResponse[];
} 