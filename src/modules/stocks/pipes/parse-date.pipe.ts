import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) {
      throw new BadRequestException('Date value is required');
    }

    try {
      // Try to parse as ISO date string
      const date = new Date(value);
      
      // Check if result is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return date;
    } catch (error) {
      throw new BadRequestException(`Invalid date format: ${value}. Expected ISO date string.`);
    }
  }
} 