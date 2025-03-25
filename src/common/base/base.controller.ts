import { Logger } from '@nestjs/common';
import { Request } from 'express';
import { ExceptionFactory } from '../exceptions/app.exception';

export class BaseController {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Extract user ID from request object
   * @param request Express request object
   * @returns User ID from JWT payload
   */
  protected getUserIdFromRequest(request: Request): string {
    const user = request.user as any;
    if (!user || !user.userId) {
      this.logger.error('User not found in request or missing userId');
      throw ExceptionFactory.unauthorized('User identity not found in request');
    }
    return user.userId;
  }
} 