import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './entities/user.entity';
import { ExceptionFactory } from '../../common/exceptions/app.exception';
import { BaseService } from '../../common/base/base.service';
import { Request } from 'express';
import { PasswordService } from '../auth/services/password.service';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => PasswordService))
    private readonly passwordService: PasswordService,
  ) {
    super(usersRepository, 'User');
  }

  /**
   * Create a new user with validation
   * @param createUserDto User creation data
   * @returns Created user document
   */
  override async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Check required fields
    if (!createUserDto.accountData.username) {
      throw ExceptionFactory.missingUserData('username');
    }
    
    if (!createUserDto.accountData.password) {
      throw ExceptionFactory.missingUserData('password');
    }
    
    // Check if username already exists
    const existingUser = await this.usersRepository.findByUsername(
      createUserDto.accountData.username,
    );

    if (existingUser) {
      throw ExceptionFactory.usernameTaken(createUserDto.accountData.username);
    }

    // Create user document
    const user = await super.create(createUserDto);
    
    // Hash password
    return this.passwordService.hashPasswordForUser(user);
  }

  /**
   * Find a user by username
   * @param username Username to search for
   * @returns User document
   */
  async findByUsername(username: string): Promise<UserDocument> {
    const user = await this.findOneOrFail({ 'accountData.username': username });
    return user;
  }

  /**
   * Update a user with error handling
   * @param id User ID
   * @param updateUserDto Update data
   * @returns Updated user document
   */
  override async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    try {
      // Create update object with dot notation for nested properties
      const updateObj: Record<string, any> = {};
      
      if (updateUserDto.accountData) {
        for (const key in updateUserDto.accountData) {
          updateObj[`accountData.${key}`] = updateUserDto.accountData[key];
        }
      }
      
      if (updateUserDto.identityData) {
        for (const key in updateUserDto.identityData) {
          updateObj[`identityData.${key}`] = updateUserDto.identityData[key];
        }
      }
      
      if (updateUserDto.settings) {
        for (const key in updateUserDto.settings) {
          updateObj[`settings.${key}`] = updateUserDto.settings[key];
        }
      }
      
      // Leverage the base service implementation with transformed update object
      return await super.update(id, updateObj);
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
        throw error;
      }
      throw ExceptionFactory.userUpdateFailed(id, error.message);
    }
  }

  /**
   * Validate user credentials
   * @param username Username
   * @param password Password
   * @returns User document if valid, null otherwise
   */
  async validateCredentials(
    username: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      user,
      password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Resolve user ID, handling special 'self' value
   * @param userId User ID from request params (may be 'self')
   * @param request Express request object (for getting current user)
   * @returns Resolved user ID
   */
  resolveUserId(userId: string, request: Request): string {
    if (userId === 'self') {
      return this.getUserIdFromRequest(request);
    }
    return userId;
  }

  /**
   * Update user settings
   * @param userId User ID 
   * @param settings Settings object with darkMode property
   * @returns Updated user
   */
  async updateSettings(userId: string, settings: { darkMode: boolean }): Promise<{
    message: string;
    darkMode: boolean;
  }> {
    if (typeof settings.darkMode !== 'boolean') {
      throw ExceptionFactory.missingUserData('darkMode setting (boolean)');
    }

    const updateUserDto: UpdateUserDto = {
      settings: { darkMode: settings.darkMode }
    };

    await this.update(userId, updateUserDto);

    return {
      message: 'User settings updated successfully',
      darkMode: settings.darkMode
    };
  }

  /**
   * Delete a user and return a success message
   * @param userId User ID to delete
   * @returns Success message
   */
  async removeWithMessage(userId: string): Promise<{ message: string }> {
    await this.remove(userId);
    return { message: 'User deleted successfully' };
  }
} 