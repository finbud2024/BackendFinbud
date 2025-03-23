import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ExceptionFactory } from '../../common/exceptions/app.exception';
import { JwtPayload } from '../../common/interfaces/auth.interface';
import { UserDocument } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  /**
   * Validates a user by their email and password
   * @param username User's email address
   * @param password User's password
   * @returns User data without sensitive information
   */
  async validateUser(username: string, password: string): Promise<any> {
    try {
      this.logger.log(`Validating user credentials for email: ${username}`);
      const user = await this.usersService.findByUsername(username);
      
      if (!user) {
        this.logger.warn(`Authentication failed: User with email ${username} not found`);
        throw ExceptionFactory.invalidCredentials();
      }
      
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        this.logger.warn(`Authentication failed: Invalid password for user with email ${username}`);
        throw ExceptionFactory.invalidCredentials();
      }
      
      this.logger.log(`User with email ${username} authenticated successfully`);
      
      // We don't want to return the password in the response
      const { accountData, ...result } = user.toJSON();
      const { password: _, ...accountDataWithoutPassword } = accountData;
      
      return {
        ...result,
        accountData: accountDataWithoutPassword,
      };
    } catch (error) {
      if (error.message === 'Invalid username or password') {
        throw error;
      }
      
      this.logger.error(`Unexpected error during user validation: ${error.message}`);
      throw ExceptionFactory.invalidCredentials();
    }
  }

  /**
   * Registers a new user and returns a JWT token
   * @param registerDto User registration data
   * @returns Created user data and access token
   */
  async register(registerDto: RegisterDto) {
    try {
      this.logger.log(`Registering new user with email: ${registerDto.username}`);
      
      // Convert RegisterDto to CreateUserDto
      const createUserDto: CreateUserDto = {
        accountData: {
          username: registerDto.username.toLowerCase(), // Store email in lowercase
          password: registerDto.password,
          priviledge: 'user', // Default to regular user
        },
        identityData: {
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          displayName: registerDto.firstName && registerDto.lastName 
            ? `${registerDto.firstName} ${registerDto.lastName}`
            : registerDto.username.split('@')[0], // Use part of email as display name if no name provided
        },
        // Default banking account and settings will be created by the schema
      };
      
      // Create user
      const newUser = await this.usersService.create(createUserDto);
      
      this.logger.log(`User registered successfully: ${newUser._id}`);
      
      // Generate JWT token
      const payload: JwtPayload = { 
        username: newUser.accountData.username, 
        sub: String(newUser._id)
      };
      
      const token = this.jwtService.sign(payload);
      
      this.logger.log(`JWT token generated successfully for newly registered user: ${newUser._id}`);
      
      // Return user info and token
      return {
        id: newUser._id,
        username: newUser.accountData.username,
        firstName: newUser.identityData?.firstName,
        lastName: newUser.identityData?.lastName,
        access_token: token,
        priviledge: newUser.accountData.priviledge
      };
      
    } catch (error) {
      if (error.message && error.message.includes('username is already taken')) {
        this.logger.warn(`Registration failed: Email ${registerDto.username} already exists`);
        throw ExceptionFactory.usernameTaken(registerDto.username);
      }
      
      this.logger.error(`Registration failed: ${error.message}`);
      throw error;
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
          username: user.accountData.username, // This is the email
          priviledge: user.accountData.priviledge
        }
      };
    } catch (error) {
      this.logger.error(`Error generating JWT token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout a user by invalidating their JWT token
   * @param token The JWT token to invalidate
   * @param userId The user ID associated with the token
   * @returns Success message
   */
  async logout(token: string, userId: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Logging out user: ${userId}`);
      
      // Invalid token check
      if (!token) {
        this.logger.warn('Logout attempted without a token');
        return { message: 'Logout successful' }; // Still return success
      }
      
      // Add token to blacklist
      await this.tokenService.invalidateToken(token, userId);
      
      this.logger.log(`User logged out successfully: ${userId}`);
      return { message: 'Logout successful' };
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`);
      // Still return success to client even if blacklisting fails
      return { message: 'Logout successful' };
    }
  }
} 