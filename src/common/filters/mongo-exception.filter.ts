import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';
import { ErrorCode } from '../exceptions/app.exception';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const path = request.url;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'DATABASE_ERROR';
    let message = 'Database operation failed';

    // Handle specific MongoDB error codes
    switch (exception.code) {
      case 11000: // Duplicate key error
        statusCode = HttpStatus.CONFLICT;
        errorCode = ErrorCode.CRYPTO_DUPLICATE_ENTRY;
        message = this.formatDuplicateKeyErrorMessage(exception);
        break;
      
      case 121: // Document validation error
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = 'VALIDATION_ERROR';
        message = 'Document validation failed';
        break;
      
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorCode = 'DATABASE_ERROR';
        message = exception.message;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path,
    });
  }

  /**
   * Formats the error message for duplicate key errors to be more user-friendly
   */
  private formatDuplicateKeyErrorMessage(exception: MongoError): string {
    const errorMessage = exception.message;
    
    // Extract the field name and value from the error message
    const matches = /index:(.+?)_1(.+?)dup key: (.+)/.exec(errorMessage);
    
    if (matches && matches.length >= 4) {
      const indexField = matches[1].trim();
      const dupValue = matches[3].trim();
      
      // For crypto symbol+date compound index (most common in our app)
      if (indexField.includes('symbol') && errorMessage.includes('date')) {
        const dateMatch = /date: new Date\((\d+)\)/.exec(errorMessage);
        if (dateMatch && dateMatch.length > 1) {
          const timestamp = parseInt(dateMatch[1]);
          const dateStr = new Date(timestamp).toISOString().split('T')[0];
          
          const symbolMatch = /symbol: "([^"]+)"/.exec(errorMessage);
          const symbol = symbolMatch && symbolMatch.length > 1 ? symbolMatch[1] : 'unknown';
          
          return `Duplicate entry for cryptocurrency ${symbol} on ${dateStr}`;
        }
      }
      
      return `Duplicate entry: ${indexField} with value ${dupValue} already exists`;
    }
    
    return 'Duplicate entry detected';
  }
} 