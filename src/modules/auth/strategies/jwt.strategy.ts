import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser, JwtPayload } from '../../../common/interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret_for_development',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser | null> {
    this.logger.debug(`Validating JWT for user ID: ${payload.sub}`);
    
    try {
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        this.logger.warn(`User not found for ID: ${payload.sub}`);
        return null;
      }
      
      // Return user object with accountData containing privilege
      return { 
        userId: payload.sub, 
        username: payload.username,
        accountData: {
          username: user.accountData.username,
          priviledge: user.accountData.priviledge
        }
      };
    } catch (error) {
      this.logger.error(`Error validating JWT: ${error.message}`);
      return null;
    }
  }
} 