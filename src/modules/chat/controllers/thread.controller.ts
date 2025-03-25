import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ThreadService } from '../services/thread.service';
import { CreateThreadDto, UpdateThreadDto } from '../dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { BaseController } from '../../../common/base/base.controller';

@Controller('threads')
@UseGuards(JwtAuthGuard)
export class ThreadController extends BaseController {
  constructor(private readonly threadService: ThreadService) {
    super();
  }

  @Post()
  create(@Body() createThreadDto: CreateThreadDto) {
    return this.threadService.create(createThreadDto);
  }

  @Post('me')
  createForCurrentUser(@Req() request: Request, @Body() createThreadDto: Partial<CreateThreadDto>) {
    return this.threadService.createForCurrentUser(request, createThreadDto);
  }

  @Get('me')
  findMyThreads(
    @Req() request: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.threadService.findAllForCurrentUser(request, page, limit);
  }

  @Get('user/:userId')
  @UseGuards(AdminGuard)
  findAllByUser(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.threadService.findThreadsByUser(userId, page, limit);
  }

  @Delete('user/:userId')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAllByUser(@Param('userId') userId: string) {
    await this.threadService.removeAllByUser(userId);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    // Admin-only: Get all threads
    return this.threadService.findAllThreads();
  }

  @Delete()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll() {
    // Admin-only: Delete all threads
    await this.threadService.removeAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threadService.findThreadById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateThreadDto: UpdateThreadDto) {
    return this.threadService.update(id, updateThreadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.threadService.remove(id);
  }
} 