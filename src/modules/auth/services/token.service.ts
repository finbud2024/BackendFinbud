import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseService } from '../../../common/base/base.service';
import { TokenRepository } from '../repositories/token.repository';
import { TokenDocument } from '../entities/token.entity';
import { JwtPayload } from '../../../common/interfaces/auth.interface';

@Injectable()
export class TokenService extends BaseService<TokenDocument> {
  constructor(
    protected readonly tokenRepository: TokenRepository,
    private readonly jwtService: JwtService,
  ) {
    super(tokenRepository, 'Token');
  }

  /**
   * Invalidate a JWT token by adding it to the blacklist
   * @param token The JWT token to invalidate
   * @param userId The user ID associated with the token
   * @returns The created token document
   */
  async invalidateToken(token: string, userId: string): Promise<TokenDocument> {
    try {
      this.logger.log(`Invalidating token for user: ${userId}`);
      
      // Decode token to get expiration
      const decoded = this.jwtService.decode(token) as JwtPayload;
      if (!decoded || !decoded.exp) {
        this.logger.warn(`Invalid token format for invalidation`);
        throw new Error('Invalid token format');
      }
      
      // Convert exp to Date
      const expiresAt = new Date(decoded.exp * 1000);
      
      // Add token to blacklist with expiration
      return this.create({
        token,
        userId,
        expiresAt,
      });
    } catch (error) {
      this.logger.error(`Error invalidating token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted/invalidated
   * @param token The token to check
   * @returns True if the token is blacklisted, false otherwise
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.tokenRepository.isTokenBlacklisted(token);
  }
} 