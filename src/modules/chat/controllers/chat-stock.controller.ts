import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ChatStockService } from '../services/chat-stock.service';
import { CreateChatStockDto, UpdateChatStockDto } from '../dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { BaseController } from '../../../common/base/base.controller';

@Controller('chat-stock')
@UseGuards(JwtAuthGuard)
export class ChatStockController extends BaseController {
  constructor(private readonly chatStockService: ChatStockService) {
    super();
  }

  @Post('update-response')
  updateResponse(@Body() createChatStockDto: CreateChatStockDto) {
    return this.chatStockService.create(createChatStockDto);
  }

  @Post('responses/me')
  createForCurrentUser(@Req() request: Request, @Body() createDto: Partial<CreateChatStockDto>) {
    return this.chatStockService.createForCurrentUser(request, createDto);
  }

  @Get('responses/me')
  findMyResponses(
    @Req() request: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatStockService.findUserChatsForCurrentUser(request, page, limit);
  }

  @Get('responses/today/me')
  findMyTodayResponse(@Req() request: Request) {
    return this.chatStockService.findTodayResponseForCurrentUser(request);
  }

  @Get('responses/today/:userId')
  @UseGuards(AdminGuard)
  findTodayResponse(@Param('userId') userId: string) {
    return this.chatStockService.findTodayResponse(userId);
  }

  @Get('responses/:userId')
  @UseGuards(AdminGuard)
  findAll(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatStockService.findUserChats(userId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatStockService.findChatStockById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateChatStockDto: UpdateChatStockDto) {
    return this.chatStockService.update(id, updateChatStockDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.chatStockService.remove(id);
  }
} 