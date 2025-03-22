import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ForbiddenResourceException } from '../exceptions/auth.exceptions';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  private readonly logger = new Logger(OwnerOrAdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;
    
    if (!user || !user.accountData || !user.accountData.priviledge) {
      this.logger.warn('Owner/Admin check failed: user or user privilege not defined');
      throw new ForbiddenResourceException();
    }
    
    // If user is admin, allow access
    if (user.accountData.priviledge === 'admin') {
      this.logger.debug(`Admin access granted to user ${user.userId}`);
      return true;
    }
    
    // If no userId param exists, deny access
    if (!params.userId) {
      this.logger.warn('Owner/Admin check failed: no userId parameter in request');
      throw new ForbiddenResourceException('User-specific resource');
    }
    
    // Allow access if user is accessing their own data
    // The 'self' string is a special case for the currently authenticated user
    if (params.userId === 'self' || params.userId === user.userId) {
      this.logger.debug(`Self-access granted to user ${user.userId}`);
      return true;
    }
    
    this.logger.warn(
      `User ${user.userId} with privilege ${user.accountData.priviledge} ` +
      `attempted to access resource belonging to user ${params.userId}`
    );
    throw new ForbiddenResourceException('User-specific resource');
  }
} 