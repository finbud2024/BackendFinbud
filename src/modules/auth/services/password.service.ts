import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../../users/entities/user.entity';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

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
    try {
      this.logger.debug(`Comparing password for user ID: ${user._id}`);
      return bcrypt.compare(candidatePassword, user.accountData.password);
    } catch (error) {
      this.logger.error(`Error comparing passwords: ${error.message}`);
      return false;
    }
  }

  /**
   * Hash a password
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Hash a password for user creation
   * @param user User document
   * @returns User document with hashed password
   */
  async hashPasswordForUser(user: UserDocument): Promise<UserDocument> {
    if (user.accountData?.password) {
      user.accountData.password = await this.hashPassword(user.accountData.password);
    }
    return user;
  }
} 