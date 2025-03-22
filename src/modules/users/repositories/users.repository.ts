import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { BaseRepository } from '../../../common/base/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel, 'User');
  }

  /**
   * Find a user by username
   * @param username The username to search for
   * @returns The user document or null
   */
  async findByUsername(username: string): Promise<UserDocument | null> {
    this.logger.debug(`Finding user by username: ${username}`);
    return this.findOne({ 'accountData.username': username });
  }

  /**
   * Compare a password with a user's stored password
   * @param user User document
   * @param candidatePassword Password to compare
   * @returns Whether the password matches
   */
  async comparePassword(
    user: UserDocument,
    candidatePassword: string,
  ): Promise<boolean> {
    this.logger.debug(`Comparing password for user ID: ${user._id}`);
    return user.comparePassword(candidatePassword);
  }
} 