import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExceptionFactory } from '../exceptions/app.exception';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);
  
  handleRequest(err: any, user: any, info: any) {
    // Handle passport errors
    if (err || !user) {
      const errorMessage = err?.message || info?.message || 'Invalid login attempt';
      this.logger.warn(`Login failed: ${errorMessage}`);
      throw err || ExceptionFactory.invalidCredentials();
    }
    
    return user;
  }
} 