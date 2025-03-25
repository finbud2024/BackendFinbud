import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { OwnerOrAdminGuard } from '../../common/guards/owner-or-admin.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const userId = this.usersService.resolveUserId(id, request);
    return this.usersService.findById(userId);
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const userId = this.usersService.resolveUserId(id, request);
    return this.usersService.update(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Patch(':id/settings')
  @HttpCode(HttpStatus.OK)
  updateSettings(
    @Param('id') id: string,
    @Body() settings: { darkMode: boolean },
    @Req() request: Request,
  ) {
    const userId = this.usersService.resolveUserId(id, request);
    return this.usersService.updateSettings(userId, settings);
  }

  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const userId = this.usersService.resolveUserId(id, request);
    return this.usersService.removeWithMessage(userId);
  }
} 