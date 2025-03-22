import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../exceptions/app.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Default error structure
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details: any = null;
    let timestamp = new Date().toISOString();

    // Handle different types of exceptions
    if (exception instanceof AppException) {
      // Our custom application exceptions
      const error = exception.getResponse() as any;
      status = exception.getStatus();
      message = error.message;
      errorCode = error.errorCode;
      details = error.details || null;
      timestamp = error.timestamp;
    } else if (exception instanceof HttpException) {
      // Standard NestJS HTTP exceptions
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || exception.message;
      }
    } else if (exception instanceof Error) {
      // Standard JavaScript errors
      message = exception.message;
      details = exception.stack || null;
    }

    // Log the error
    this.logError(request, exception, status);

    // Return consistent error response
    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      details,
      timestamp,
      path: request.url,
    });
  }

  private logError(request: Request, exception: unknown, statusCode: number) {
    const { method, url } = request;

    if (statusCode >= 500) {
      this.logger.error(
        `[${method}] ${url} - ${statusCode} - ${this.getErrorMessage(exception)}`,
        exception instanceof Error ? exception.stack : null,
      );
    } else {
      this.logger.warn(
        `[${method}] ${url} - ${statusCode} - ${this.getErrorMessage(exception)}`,
      );
    }
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'object'
        ? (response as any).message || exception.message
        : (response as string) || exception.message;
    }

    return exception instanceof Error
      ? exception.message
      : String(exception);
  }
} 