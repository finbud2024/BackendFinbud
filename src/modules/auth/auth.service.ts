import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InvalidCredentialsException } from '../../common/exceptions/user.exceptions';
import { JwtPayload } from '../../common/interfaces/auth.interface';
import { UserDocument } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      this.logger.log(`Validating user credentials for username: ${username}`);
      const user = await this.usersService.findByUsername(username);
      
      if (!user) {
        this.logger.warn(`Authentication failed: User ${username} not found`);
        throw new InvalidCredentialsException();
      }
      
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        this.logger.warn(`Authentication failed: Invalid password for user ${username}`);
        throw new InvalidCredentialsException();
      }
      
      this.logger.log(`User ${username} authenticated successfully`);
      
      // We don't want to return the password in the response
      const { accountData, ...result } = user.toJSON();
      const { password: _, ...accountDataWithoutPassword } = accountData;
      
      return {
        ...result,
        accountData: accountDataWithoutPassword,
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsException) {
        throw error;
      }
      
      this.logger.error(`Unexpected error during user validation: ${error.message}`);
      throw new InvalidCredentialsException();
    }
  }

  async login(user: UserDocument | any) {
    try {
      this.logger.log(`Generating JWT token for user: ${user._id}`);
      
      const payload: JwtPayload = { 
        username: user.accountData.username, 
        sub: user._id
      };
      
      const token = this.jwtService.sign(payload);
      
      this.logger.log(`JWT token generated successfully for user: ${user._id}`);
      
      return {
        access_token: token,
        user: {
          userId: user._id,
          username: user.accountData.username,
          priviledge: user.accountData.priviledge
        }
      };
    } catch (error) {
      this.logger.error(`Error generating JWT token: ${error.message}`);
      throw error;
    }
  }
} 