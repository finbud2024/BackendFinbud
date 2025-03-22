import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: string,
    details?: any
  ) {
    super(
      {
        statusCode,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode
    );
  }
} 