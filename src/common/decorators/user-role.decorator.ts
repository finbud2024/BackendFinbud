import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the user's privilege from the request
 * Usage: @UserRole() role: string | null
 */
export const UserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.accountData || !user.accountData.priviledge) {
      return null;
    }
    
    return user.accountData.priviledge;
  },
); 