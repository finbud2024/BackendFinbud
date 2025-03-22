import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './entities/user.entity';
import {
  UserNotFoundException,
  UsernameTakenException,
  MissingUserDataException,
  UserUpdateFailedException,
} from '../../common/exceptions/user.exceptions';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(private readonly usersRepository: UsersRepository) {
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
      throw new MissingUserDataException('username');
    }
    
    if (!createUserDto.accountData.password) {
      throw new MissingUserDataException('password');
    }
    
    // Check if username already exists
    const existingUser = await this.usersRepository.findByUsername(
      createUserDto.accountData.username,
    );

    if (existingUser) {
      throw new UsernameTakenException(createUserDto.accountData.username);
    }

    return super.create(createUserDto);
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
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new UserUpdateFailedException(id, error.message);
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

    const isPasswordValid = await this.usersRepository.comparePassword(
      user,
      password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
} 