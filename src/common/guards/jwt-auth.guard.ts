import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { ExceptionFactory } from '../exceptions/app.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    // Check if the Authorization header is present
    if (!authHeader) {
      this.logger.warn(`Missing Authorization header: ${request.url}`);
      throw ExceptionFactory.missingToken();
    }
    
    // Check if the Authorization header has the Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn(`Invalid Authorization header format: ${request.url}`);
      throw ExceptionFactory.invalidToken();
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Handle passport errors
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        this.logger.warn(`Token expired: ${info.message}`);
        throw ExceptionFactory.invalidToken();
      }
      
      if (info?.name === 'JsonWebTokenError') {
        this.logger.warn(`JWT error: ${info.message}`);
        throw ExceptionFactory.invalidToken();
      }
      
      this.logger.error(`Authentication failed: ${err?.message || 'Unknown error'}`);
      throw err || ExceptionFactory.unauthorized();
    }
    
    return user;
  }
} 