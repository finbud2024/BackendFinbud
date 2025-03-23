import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser, JwtPayload } from '../../../common/interfaces/auth.interface';
import { TokenService } from '../services/token.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret_for_development',
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<AuthenticatedUser | null> {
    this.logger.debug(`Validating JWT for user ID: ${payload.sub}`);
    
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      const token = authHeader?.split(' ')[1];
      
      if (!token) {
        this.logger.warn('No token found in request');
        throw new UnauthorizedException('No token provided');
      }
      
      // Check if token is blacklisted
      const isBlacklisted = await this.tokenService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        this.logger.warn(`Token is blacklisted for user: ${payload.sub}`);
        throw new UnauthorizedException('Token has been invalidated');
      }
      
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        this.logger.warn(`User not found for ID: ${payload.sub}`);
        return null;
      }
      
      this.logger.debug(`Found user in database: ${user._id} with privilege: ${user.accountData.priviledge}`);
      
      // Return user object with accountData containing privilege
      const authUser = { 
        userId: payload.sub, 
        username: payload.username,
        accountData: {
          username: user.accountData.username,
          priviledge: user.accountData.priviledge
        }
      };
      
      return authUser;
    } catch (error) {
      this.logger.error(`Error validating JWT: ${error.message}`);
      throw error;
    }
  }
} 