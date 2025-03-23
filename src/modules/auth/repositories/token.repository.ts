import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/base/base.repository';
import { Token, TokenDocument } from '../entities/token.entity';

@Injectable()
export class TokenRepository extends BaseRepository<TokenDocument> {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>
  ) {
    super(tokenModel, 'Token');
  }

  /**
   * Find a token in the blacklist
   * @param token The token to check
   * @returns The token document if found, null otherwise
   */
  async findToken(token: string): Promise<TokenDocument | null> {
    return this.findOne({ token });
  }

  /**
   * Check if a token is blacklisted
   * @param token The token to check
   * @returns True if token is blacklisted, false otherwise
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.exists({ token });
  }
} 