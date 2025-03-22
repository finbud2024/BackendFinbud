import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Logger,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MissingUserDataException } from '../../common/exceptions/user.exceptions';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { OwnerOrAdminGuard } from '../../common/guards/owner-or-admin.guard';
import { UserRole } from '../../common/decorators/user-role.decorator';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // GET: Get all users - Admin only
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async findAll() {
    this.logger.log('GET /users - Retrieving all users');
    return this.usersService.findAll();
  }

  // GET: Get specific user by ID
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Get(':userId')
  async findOne(
    @Param('userId') userId: string,
    @UserRole() userRole: string | null,
    @Req() request: Request
  ) {
    this.logger.log(
      `GET /users/${userId} - Retrieving user with ID: ${userId} (Role: ${userRole})`,
    );
    
    const resolvedUserId = userId === 'self' ? this.getUserIdFromRequest(request) : userId;
    return this.usersService.findById(resolvedUserId);
  }

  // POST: Create a new user
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('POST /users - Creating new user');
    
    // Validation is now moved to the service layer
    const newUser = await this.usersService.create(createUserDto);
    return newUser;
  }

  // PUT: Update user by ID
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Put(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserRole() userRole: string | null,
    @Req() request: Request
  ) {
    this.logger.log(
      `PUT /users/${userId} - Updating user with ID: ${userId} (Role: ${userRole})`,
    );
    
    const resolvedUserId = userId === 'self' ? this.getUserIdFromRequest(request) : userId;
    const updatedUser = await this.usersService.update(resolvedUserId, updateUserDto);
    return { message: 'User updated successfully', updatedUser };
  }

  // PUT: Update user settings
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Put(':userId/settings')
  async updateSettings(
    @Param('userId') userId: string,
    @Body() updateData: { settings: { darkMode: boolean } },
    @UserRole() userRole: string | null,
    @Req() request: Request
  ) {
    this.logger.log(
      `PUT /users/${userId}/settings - Updating settings for user ID: ${userId} (Role: ${userRole})`,
    );

    if (
      !updateData.settings ||
      typeof updateData.settings.darkMode !== 'boolean'
    ) {
      throw new MissingUserDataException('darkMode setting (boolean)');
    }

    const updateUserDto: UpdateUserDto = {
      settings: updateData.settings
    };

    const resolvedUserId = userId === 'self' ? this.getUserIdFromRequest(request) : userId;
    await this.usersService.update(resolvedUserId, updateUserDto);

    return {
      message: 'User settings updated successfully',
      darkMode: updateData.settings.darkMode
    };
  }

  // DELETE: Delete user by ID
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('userId') userId: string) {
    this.logger.log(
      `DELETE /users/${userId} - Deleting user with ID: ${userId}`,
    );
    await this.usersService.remove(userId);
    return { message: 'User deleted successfully' };
  }
  
  // Private helper method to get current user ID from request
  private getUserIdFromRequest(request: Request): string {
    const user = request.user as any;
    if (!user || !user.userId) {
      this.logger.error('User not found in request or missing userId');
      throw new UnauthorizedException('User identity not found in request');
    }
    return user.userId;
  }
} 