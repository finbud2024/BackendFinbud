import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ExceptionFactory } from '../exceptions/app.exception';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.accountData || !user.accountData.priviledge) {
      this.logger.warn('Admin check failed: user or user privilege not defined');
      throw ExceptionFactory.forbidden();
    }
    
    if (user.accountData.priviledge !== 'admin') {
      this.logger.warn(`User with privilege ${user.accountData.priviledge} attempted to access admin-only resource`);
      throw ExceptionFactory.forbidden('Admin resources');
    }
    
    return true;
  }
} 