import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { AiService } from '../services/ai.service';
import { CreateChatDto, UpdateChatDto, QueryDto } from '../dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { Source } from '../interfaces/source.interface';
import { BaseController } from '../../../common/base/base.controller';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController extends BaseController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: AiService
  ) {
    super();
  }

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Post('query')
  async query(
    @Body() queryDto: QueryDto, 
    @Req() request: Request
  ): Promise<{
    answer: string;
    sources: Source[];
    followUpQuestions: string[];
    chatId: string;
    threadId: string;
  }> {
    return this.aiService.processQueryWithRequest(queryDto, request);
  }

  @Get('thread/:threadId')
  findByThreadId(@Param('threadId') threadId: string) {
    return this.chatService.findByThreadId(threadId);
  }

  @Delete('thread/:threadId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByThreadId(@Param('threadId') threadId: string) {
    await this.chatService.removeByThreadId(threadId);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    // Admin-only: Get all chats
    return this.chatService.findAll();
  }

  @Delete()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll() {
    // Admin-only: Delete all chats
    await this.chatService.removeAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.chatService.remove(id);
  }
} 