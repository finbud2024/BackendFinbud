import { Controller, Get, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { Forum } from '../entities/forum.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('forums')
@UseGuards(JwtAuthGuard) 
export class ForumController {
  constructor(private readonly forumService: ForumService) {
  }

  @Get()
  async findAll(): Promise<Forum[]> {
    return this.forumService.findAll();
  }

  @Post('init')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async initForums(): Promise<{ message: string }> {
    return this.forumService.initDefaultForums();
  }
}
